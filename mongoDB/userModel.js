var mongoose = require('mongoose');  // import mongoose

mongoose.connection.on('error', function () {
    console.log('there was an error communicating with the database');
});

mongoose.connect('mongodb://localhost/userdb', {'useNewUrlParser': true}, function(err) {  // connecting database
    if(err) {
        console.log('Connection error', err);
    } else {
        console.log('Database Connection Successful...');
    }
});

mongoose.set('useFindAndModify', false); // these commands are there to avoid deprecation warnings
mongoose.set('useCreateIndex', true);

var userSchema = new mongoose.Schema({   // our database schema
    userName: String,
    fullName: String,
    registered: Boolean,
    userId: String,
    password: String,
    authenticators: [{
        fmt: String,
        publicKey: String,
        counter: Number,
        credID: String
    }],
});

var user = mongoose.model('user', userSchema);  // our database model

module.exports = user; // exporting model

var u = new user({ // creating an example user
    userName: "Test123",
    fullName: "Test User",
    registered: true,
    userId: "MIwN9f_G5K07dmKqCo-UmP6YEHMiFyazIKmHTvK6_ic",
    password: "",
    authenticators: [{
        fmt: "fido-u2f",
        publicKey: "BHcV7kgwTYkpV0JUyXwI3D3ltPVagE3QHJm7prL8Vx9b3vaT8SPY08v3oGSZ1j7z_hgrhWWU5DU5VhpiwzPzx-I",
        counter: 0,
        credID: "jDxz3ZWizTJDCF7EUHlU_pYNh3mo9AxA69ONOW0a1OJv6RvVrvsARdwmqOTjUQa1BGTQmjcYwJ5S7G70QLt9bA"
    }],
});

user.find(function (err, data) { // finds all data in database
    if (err) return next(err);
    if (data.length==0) u.save(); // adds example user, if database empty
});

