//Yer standard includes. Nforce for SF Auth, Faye for cometD, no-kafka for yes-kafka, and fs for a thing.
const jsforce = require('jsforce');
const fs = require('fs');
const Kafka = require('no-kafka');
const faye = require('faye');
const { time } = require('console');

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

/// connect to the SF org
console.log('Authenticating with Service Cloud...');
conn.login(username, password, function(err, res) {
    if (err) {
        return console.error(err);
    }
    console.log(`\nAuthenticated with Service Cloud: ${res}`);
});

const sendPlatEvent = (payload) => {
    console.log(`Sending ${payload} to service cloud`);
    conn.sobject('Case_Event__e').create(payload, (err,ret) => {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log("Created record id : " + ret.id);
    });
};

// when we see a case kafka message...send it on down the line
const dataHandler = (messageSet, topic, partition) => {
    messageSet.forEach(function (m) {
        console.log('Message Received:');
        console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
        sendPlatEvent(m.message.value);

    });
};

// listen to kafka
return consumer.init().then(() => {
    console.log('Consumer initiated');

    consumer.subscribe(`${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`, dataHandler);

    console.log('Consumer subscribed');
});