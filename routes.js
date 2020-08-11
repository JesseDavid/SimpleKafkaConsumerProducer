const express = require('express');
const router = express.Router();
const producer = require('./producer');

/**
 * Receives run information from the MatLab server, parses it, and inserts
 * into the database that is synced with Salesforce
 */
router.post('/case', async function(req, res, next) {
  
  console.log("Got case: " + JSON.stringify(req.body));
  console.log("Got the case info....sending it to Salesforce");

  producer.produceMessage(req.body)
    .then(res.send(200));

});

module.exports = router;