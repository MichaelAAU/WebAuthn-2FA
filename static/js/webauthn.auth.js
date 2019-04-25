'use strict';

/* Handle for register form submission */
$('#register').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let name     = this.name.value;
    let password = this.password.value;

    if(!username || !name) {
        alert('Name or username is missing!');
        return
    }
    if(!password) {
        getMakeCredentialsChallenge({username, name})
            .then((response) => {
                let publicKey = preformatMakeCredReq(response);
                return navigator.credentials.create({publicKey})
            })
            .then((response) => {
                let makeCredResponse = publicKeyCredentialToJSON(response);
                console.log(makeCredResponse);
                return sendWebAuthnResponse(makeCredResponse)
            })
            .then((response) => {
                if (response.status === 'ok') {
                    $('body').css('backgroundImage', 'url(/img/Bank2.jpg)');
                    loadMainContainer()
                } else {
                    alert(`Server responded with error. The message is: ${response.message}`);
                }
            })
            .catch((error) => alert(error))
    }
    else {
        getMakeCredentialsChallenge({username, name, password})
            .then((response) => {
                let publicKey = preformatMakeCredReq(response);
                return navigator.credentials.create({publicKey})
            })
            .then((response) => {
                let makeCredResponse = publicKeyCredentialToJSON(response);
                console.log(makeCredResponse);
                return sendWebAuthnResponse(makeCredResponse)
            })
            .then((response) => {
                if (response.status === 'ok') {
                    $('body').css('backgroundImage', 'url(/img/Bank2.jpg)');
                    loadMainContainer()
                } else {
                    alert(`Server responded with error. The message is: ${response.message}`);
                }
            })
            .catch((error) => alert(error))
    }
});

let getMakeCredentialsChallenge = (formBody) => {
    return fetch('/webauthn/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
        .then((response) => response.json())
        .then((response) => {
            if(response.status !== 'ok')
                throw new Error(`Server responded with error. The message is: ${response.message}`);

            return response
        })
};

let sendWebAuthnResponse = (body) => {
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((response) => response.json())
        .then((response) => {
            if(response.status !== 'ok')
                throw new Error(`Server responded with error. The message is: ${response.message}`);

            return response
        })
};

/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let password = this.password.value;

    if(!username) {
        alert('Username is missing!');
        return
    }

    if(!password) {
        getGetAssertionChallenge({username})
            .then((response) => {
                let publicKey = preformatGetAssertReq(response);
                return navigator.credentials.get({publicKey})
            })
            .then((response) => {
                let getAssertionResponse = publicKeyCredentialToJSON(response);
                return sendWebAuthnResponse(getAssertionResponse)
            })
            .then((response) => {
                if (response.status === 'ok') {
                    $('body').css('backgroundImage', 'url(/img/Bank2.jpg)');
                    loadMainContainer()
                } else {
                    alert(`Server responded with error. The message is: ${response.message}`);
                }
            })
            .catch((error) => alert(error))
    }
    else {
        getGetAssertionChallenge({username, password})
            .then((response) => {
                let publicKey = preformatGetAssertReq(response);
                return navigator.credentials.get({publicKey})
            })
            .then((response) => {
                let getAssertionResponse = publicKeyCredentialToJSON(response);
                return sendWebAuthnResponse(getAssertionResponse)
            })
            .then((response) => {
                if (response.status === 'ok') {
                    $('body').css('backgroundImage', 'url(/img/Bank2.jpg)');
                    loadMainContainer()
                } else {
                    alert(`Server responded with error. The message is: ${response.message}`);
                }
            })
            .catch((error) => alert(error))
    }
});

let getGetAssertionChallenge = (formBody) => {
    return fetch('/webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
        .then((response) => response.json())
        .then((response) => {
            if(response.status !== 'ok')
                throw new Error(`Server responded with error. The message is: ${response.message}`);

            return response
        })
};
