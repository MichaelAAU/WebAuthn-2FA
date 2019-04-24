/* ----- loads web framework and middleware ----- */
const express       = require('express');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser  = require('cookie-parser');
const urllib        = require('url');
const path          = require('path');
const crypto        = require('crypto');

/* ----- loads x509 certificate tools ----- */
const x509          = require('@fidm/x509');

/* ----- loads country-codes parser ----- */
const iso_3166_1    = require('iso-3166-1');

/* ----- path constants ----- */
const config        = require('./config.json');
const defaultroutes = require('./routes/default');
const webAuthnAuthentication  = require('./routes/webauthn2FA');

/* ----- express web framework constant ----- */
const app           = express();

/* ----- parses request bodies to JSON----- */
app.use(bodyParser.json());

/* ----- stores session data within a cookie on the client ----- */
app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/* ----- parses and decrypts cookies ----- */
app.use(cookieParser());

/* ----- serves static files ----- */
app.use(express.static(path.join(__dirname, 'static/')));

/* ----- sets up the express routes ----- */
app.use('/', defaultroutes);
app.use('/webauthn', webAuthnAuthentication);

/* ----- port configuration ----- */
const port = config.port || 3000;
app.listen(port);
console.log(`Started Web Authentication app on port ${port}`);

module.exports = app;
