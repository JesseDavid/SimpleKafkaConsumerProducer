const express = require('express');
const router = express.Router();
const producer = require('./producer');

router.post('/inbound', async function(req, res) {
  
  console.log("Got api message: " + JSON.stringify(req.body));
  console.log("Got the case info\n....sending it to Salesforce");

  producer.produceMessage(req.body);
  res.send(200);

});

router.post('/outbound', async function(req, res) {
  
    console.log("Got api update from Salesforce: " + JSON.stringify(req.body));
    console.log("Got update\n....adding it to the topic");

    producer.produceMessage(req.body);
    res.send(200);
});

module.exports = router;