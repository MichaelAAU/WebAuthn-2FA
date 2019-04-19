let checkIfLoggedIn = () => {
    return fetch('/isLoggedIn', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                return true
            } else {
                return false
            }
        })
};

/**
 * Switch to registration page
 */
$('#toRegistration').click(function(e) {
    e.preventDefault();
    $('#loginContainer').hide();
    $('#registerContainer').show();
});

let loadMainContainer = () => {
    return fetch('/personalInfo', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                $('#theSecret').html(response.theSecret)
                $('#name').html(response.name)
                $('#registerContainer').hide();
                $('#loginContainer').hide();
                $('#mainContainer').show();
            } else {
                alert(`Error! ${response.message}`)
            }
        })
};


$('#logoutButton').click(() => {
    fetch('/logout', {credentials: 'include'});

    $('#registerContainer').hide();
    $('#mainContainer').hide();
    $('#loginContainer').show();
});

/**
 * Switch to login page
 */
$('#toLogin').click(function(e) {
    e.preventDefault();
    $('#registerContainer').hide();
    $('#loginContainer').show();
});
