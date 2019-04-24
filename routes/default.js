const express  = require('express');
const utils    = require('../utils');
const router   = express.Router();
const user = require('../mongoDB/userModel');

/* Returns if user is logged in, with a status */
router.get('/isLoggedIn', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed'
        })
    } else {
        response.json({
            'status': 'ok'
        })
    }
});

/* Logs user out */
router.get('/logout', (request, response) => {
    request.session.loggedIn = false;
    request.session.username = undefined;

    response.json({
        'status': 'ok'
    })
});

/* Returns personal info and THE SECRET INFORMATION */
router.get('/personalInfo', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed',
            'message': 'Access denied'
        })
    } else {
        user.findOne({userName:request.session.username}, function (err, u) { // looks for the user in the database
            if (err) return next(err);
            response.json({
                'status': 'ok',
                'name': u.userName,
                'theSecret': '<img width="250px" src="img/theworstofthesecrets.jpg">'
            })
        });
    }
});

module.exports = router;
