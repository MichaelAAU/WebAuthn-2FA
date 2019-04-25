const express   = require('express');
const utils     = require('../utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const user = require('../mongoDB/userModel');

/* ---------- ROUTES START ---------- */

router.post('/register', (request, response) => {
    if(!request.body || !request.body.username || !request.body.name) {
        response.json({
            'status': 'failed',
            'message': 'Request missing name or username field!'
        });
        return
    }

    let username = request.body.username;
    let name     = request.body.name;
    let password = request.body.password;
    let userid   = utils.randomBase64URLBuffer();

    user.findOne({userName:username}, function (err, u) { // looks for the user in the database
        if (err) return next(err);
        if (u !== null && u.registered) { // checks if the user is already registered
            response.json({
                'status': 'failed',
                'message': `Username ${username} already exists`
            });
            return
        }
    });

    user.create({ // creates a new user in the database and a request for credentials
        userName: username,
        fullName: name,
        password: password,
        userId: userid,
        authenticators: []}, function(err, u) {
        if (err) return next(err);
        if(!password) {
            var challengeMakeCred = utils.generateServerMakeCredRequestUV(username, name, userid);
        }
        else {
            var challengeMakeCred = utils.generateServerMakeCredRequest(username, name, userid);
        }
        challengeMakeCred.status = 'ok';

        request.session.challenge = challengeMakeCred.challenge;
        request.session.username  = username;

        response.json(challengeMakeCred);
        console.log(challengeMakeCred)
    });
});


router.post('/response', (request, response) => {
    if(!request.body       || !request.body.id
        || !request.body.rawId || !request.body.response
        || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        });

        return
    }

    let webauthnResp = request.body;
    let clientData   = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));

    /* Check challenge... */
    if(clientData.challenge !== request.session.challenge) {
        response.json({
            'status': 'failed',
            'message': 'Challenges don\'t match!'
        })
    }

    /* ...and origin */
    if(clientData.origin !== config.origin) {
        response.json({
            'status': 'failed',
            'message': 'Origins don\'t match!'
        })
    }

    let result;
    if(webauthnResp.response.attestationObject !== undefined) {
        /* This is the create-credential flow because we have an attestation object */
        result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);

        if(result.verified) {
            user.findOneAndUpdate({userName:request.session.username},
                {authenticators: result.authrInfo, registered: true}, function (err, u) { // finds and updates user in the database
                if (err) return next(err);
                request.session.loggedIn = true;
                console.log('User ', request.session.username, ' was successfully Registered!');
                response.json({ 'status': 'ok' })
            });
        } else {
            response.json({
                'status': 'failed',
                'message': 'Can not authenticate signature!'
            })
        }
    } else if(webauthnResp.response.authenticatorData !== undefined) {
        /* This is the get-assertion flow because we have authenticator data */
        user.findOne({userName:request.session.username}, function (err, u) { // looks for the user in the database
            if (err) return next(err);
            result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, u.authenticators);
            if(result.verified) {
                request.session.loggedIn = true;
                console.log('User ', request.session.username, ' was successfully Logged In!');
                response.json({ 'status': 'ok' })
            } else {
                response.json({
                    'status': 'failed',
                    'message': 'Can not authenticate signature!'
                })
            }
        });
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }
});


router.post('/login', (request, response) => {
    if(!request.body || !request.body.username) {
        response.json({
            'status': 'failed',
            'message': 'Request missing username field!'
        });

        return
    }

    let username = request.body.username;
    let password = request.body.password;

    user.findOne({userName:username}, function (err, u) { // looks for the user in the database
        if (err) return next(err);
        if(u == null || u.password !== password || !u.registered) { // checks registered username & password
            response.json({
                'status': 'failed',
                'message': `Wrong username or password!`
            });

            return
        }
        if(!password) {
            var getAssertion = utils.generateServerGetAssertionUV(u.authenticators);
        }
        else {
            var getAssertion = utils.generateServerGetAssertion(u.authenticators);
        }
        getAssertion.status = 'ok';

        request.session.challenge = getAssertion.challenge;
        request.session.username  = username;

        response.json(getAssertion)
    });

});

/* ---------- ROUTES END ---------- */

module.exports = router;
