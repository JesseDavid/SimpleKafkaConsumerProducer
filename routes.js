const express = require('express');
const router = express.Router();
const producer = require('./producer');

/**
 * Receives run information from the MatLab server, parses it, and inserts
 * into the database that is synced with Salesforce
 */
router.post('/case/inbound', async function(req, res, next) {
  
  console.log("Got case: " + JSON.stringify(req.body));
  console.log("Got the case info....sending it to Salesforce");

  producer.produceMessage(req.body);
  res.send(200);

});

router.post('/case/outbound', async function(req, res, next) {
  
    console.log("Got case update from Salesforce: " + JSON.stringify(req.body));
    console.log("Got the case info....adding it to the topic");

    producer.produceMessage(req.body, process.env.SF_KAFKA_TOPIC)
    res.send(200);
});

module.exports = router;