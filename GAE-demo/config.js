'use strict';

const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'CLOUD_BUCKET',
    'DATA_BACKEND',
    'GCLOUD_PROJECT',
    'MEMCACHE_URL',
    'NODE_ENV',
    'OAUTH2_CLIENT_ID',
    'OAUTH2_CLIENT_SECRET',
    'OAUTH2_CALLBACK',
    'PORT',
    'SECRET'
  ])
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    // Typically you will create a bucket with the same name as your project ID.
    CLOUD_BUCKET: '',

    // dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
    // configure the appropriate settings for each storage engine below.
    // If you are unsure, use datastore as it requires no additional
    // configuration.
    DATA_BACKEND: 'datastore',

    // This is the id of your project in the Google Cloud Developers Console.
    GCLOUD_PROJECT: '',

    // Connection url for the Memcache instance used to store session data
    MEMCACHE_URL: 'localhost:11211',



    OAUTH2_CLIENT_ID: '',
    OAUTH2_CLIENT_SECRET: '',
    OAUTH2_CALLBACK: 'http://localhost:8080/auth/google/callback',

    PORT: 8080,

    // Set this a secret string of your choosing
    SECRET: 'keyboardcat'
  });

// Check for required settings
checkConfig('GCLOUD_PROJECT');
checkConfig('CLOUD_BUCKET');
checkConfig('OAUTH2_CLIENT_ID');
checkConfig('OAUTH2_CLIENT_SECRET');

// if (nconf.get('DATA_BACKEND') === 'cloudsql') {
//   checkConfig('MYSQL_USER');
//   checkConfig('MYSQL_PASSWORD');
//   if (nconf.get('NODE_ENV') === 'production') {
//     checkConfig('INSTANCE_CONNECTION_NAME');
//   }
// }



//check config .
function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
