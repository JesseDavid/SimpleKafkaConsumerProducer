const express = require('express');
const router = express.Router();
const jsforce = require('jsforce');
const producer = require('./producer');

const outboundTopic = process.env.OUTBOUND_TOPIC;
const inboundTopic = process.env.INBOUND_TOPIC;

const clientId = process.env.SF_CONNECTED_APP_CLIENT_ID;
const clientSecret = process.env.SF_CONNECTED_APP_SECRET;
const redirectUri = process.env.SF_CONNECTED_APP_REDIRECT;


var oauth2 = new jsforce.OAuth2({
  clientId,
  clientSecret,
  redirectUri
});

router.post('/inbound', async function(req, res) {
  
  console.log("Got api message: " + JSON.stringify(req.body, null, 4));

  producer.produceMessage(req.body, inboundTopic);
  res.sendStatus(200);

});

router.post('/outbound', async function(req, res) {
  
    console.log("Got api update from Salesforce: " + JSON.stringify(req.body, null, 4));
    console.log("Got update\n....adding it to the topic");

    producer.produceMessage(req.body, outboundTopic);
    res.sendStatus(200);
});

router.get('/oauth2/callback', function(req, res) {
  var conn = new jsforce.Connection({ oauth2 });
  var code = req.params('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token, refresh token, and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.refreshToken);
    console.log(conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    // ...
    res.sendStatus('success'); // or your desired response
  });
});

router.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
});

module.exports = router;