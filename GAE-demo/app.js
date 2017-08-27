'use strict';
// Activate Google Cloud Trace and Debug when in production
if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
  require('@google-cloud/debug-agent').start();
}
// [END debug]
//libs
const path = require('path');
const express = require('express');
const session = require('express-session');
const MemcachedStore = require('connect-memcached')(session);
const passport = require('passport');
const config = require('./config');
const logging = require('./lib/logging');
const bodyParser = require('body-parser');
//process.env.SENDGRID_API
const SENDGRID_API_KEY = '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';
const SENDGRID_SENDER = 'hienminhnguyen711@gmail.com';
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY);


const app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);


// Parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add the request logger before anything else so that it can
// accurately log requests.
// [START requests]
app.use(logging.requestLogger);
// [END requests]

// Configure the session and session storage.
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.get('SECRET'),
  signed: true
};

// In production use the App Engine Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config.get('NODE_ENV') === 'production' && config.get('MEMCACHE_URL')) {
  sessionConfig.store = new MemcachedStore({
    hosts: [config.get('MEMCACHE_URL')]
  });
}

app.use(session(sessionConfig));

// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./lib/oauth2').router);

//PRODUCTS
app.use('/products', require('./products/crud'));
app.use('/api/products', require('./products/api'));


//CUSTOMERS



// Redirect root to /products
app.get('/', (req, res) => {
  res.redirect('/products');
});

/**
 * MAIL WITH SENDGRID
 */
app.get('/mail',(req, res) => {
  res.render('mail/index')//get the view
})
//post email
app.post('/mail', (req, res, next) => {
  const sgReq = Sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email: req.body.email }],
        subject: req.body.subject
      }],
      from: { email: SENDGRID_SENDER },
      content: [{
        type: 'text/plain',
        value: req.body.content
      }]
    }
  });

  Sendgrid.API(sgReq, (err) => {
    if (err) {
      next(err);
      return;
    }
    // Render the index route on success
    res.render('mail/success', {
      sent: true
    });
    return;
  });
});







// Add the error logger after all middleware and routes so that
// it can log errors from the whole application. Any custom error
// handlers should go after this.
// [START errors]
app.use(logging.errorLogger);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not found request');
});

// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Sorry. Something is broken. Please check again ');
});
// [END errors]

if (module === require.main) {
  // Start the server
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
