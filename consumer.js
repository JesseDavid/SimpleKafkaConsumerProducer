const producer = require('./producer');

const jsforce = require('jsforce');
const fs = require('fs');
const Kafka = require('no-kafka');
const { publicDecrypt } = require('crypto');

//Kafka setup below
fs.writeFileSync('./client.crt', process.env.KAFKA_CLIENT_CERT);
fs.writeFileSync('./client.key', process.env.KAFKA_CLIENT_CERT_KEY);

console.log('Starting consumer initialization');

//Kafka Consumer
const consumer = new Kafka.SimpleConsumer({
    connectionString: process.env.KAFKA_URL,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
});
  
//Salesforce auth info here
const username = process.env.SF_API_USERNAME;
const password = process.env.SF_API_PASSWORD;
const conn = new jsforce.Connection({
    loginUrl : process.env.SF_LOGIN_URL
});
const changeSubscribeTopic = process.env.OUTBOUND_TOPIC;
const sfEventBusUrl = process.env.SF_EVENT_BUS_URL; // i.e. "/event/IA_AccountEvent_Outbound__e"
const sfInboundEventName = process.env.SF_INBOUND_EVENT_NAME; // i.e. "IA_AccountEvent_Inbound__e"

/// 1: connect to the SF org
console.log('Consumer Authenticating with Salesforce...');

conn.login(username, password, function(err, res) {
    if (err) {
        return console.error(err);
    }
    console.log(`\nConsumer Authenticated with Salesforce: ${JSON.stringify(res)}`);

    // 2: Initialize the producer
    consumer.init().then(() => {
        // 3: listen to any messages the producer process has put on our "INBOUND_TOPIC" topic,
        // and send them over to Salesforce
        producerListen().then(() => {
            // 4: Subscribe to messages coming FROM the SF platform on the OUTBOUND_TOPIC topic
            // /event/IA_AccountEvent_Outbound__e
            conn.streaming.topic(sfEventBusUrl).subscribe((message) =>{
                console.log('\n\nSF updated object: ' + JSON.stringify(message, null, 4));
                console.log('Publishing to Kafka...');
                producer.produceMessage(message, changeSubscribeTopic);
            });
        });
    });
});

// When we see a kafka message on the INBOUND_TOPIC, send it to Salesforce
const inboundDataHandler = (messageSet, topic, partition) => {
    messageSet.forEach(function (m) {
        console.log(`Processing message on ${topic} topic`);
        console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
        sendPlatEvent(m.message.value, m.offset);
    });
};

// Send on that kafka message as a plat event
const sendPlatEvent = (payload, offset) => {
    let payloadObj = JSON.parse(payload);
    payloadObj.KakfaOffset__c = offset;
    console.log(`Sending ${JSON.stringify(payloadObj, null, 4)} \n to Salesforce Event Bus: ${sfInboundEventName}`);

    // Wrapper for API callout to create Salesforce Platform Event
    conn.sobject(sfInboundEventName).create(JSON.parse(payload), (err,ret) => {
        if (err || !ret.success) { return console.error(`ERROR ${err}`, ret); }
        console.log("Created Platform Event with ID: " + ret.id);
    });
};

// Actually get this Kafka producer up and running
const producerListen = () => {
    console.log('Kafka Consumer initiated');

    return consumer.subscribe(`${process.env.KAFKA_PREFIX}${process.env.INBOUND_TOPIC}`, inboundDataHandler)
        .then(() =>{
            console.log('Kafka Consumer subscribed');
            return;
        });
};