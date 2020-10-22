const express = require('express');
const router = express.Router();
const producer = require('./producer');

const outboundTopic = process.env.OUTBOUND_TOPIC;
const inboundTopic = process.env.INBOUND_TOPIC;

router.post('/inbound', async function(req, res) {
  
  console.log("Got api message: " + JSON.stringify(req.body));
  console.log("Got the case info\n....sending it to Salesforce");

  producer.produceMessage(req.body, inboundTopic);
  res.send(200);

});

router.post('/outbound', async function(req, res) {
  
    console.log("Got api update from Salesforce: " + JSON.stringify(req.body));
    console.log("Got update\n....adding it to the topic");

    producer.produceMessage(req.body, outboundTopic);
    res.send(200);
});

module.exports = router;