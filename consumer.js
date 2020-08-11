//Yer standard includes. Nforce for SF Auth, Faye for cometD, no-kafka for yes-kafka, and fs for a thing.
const nforce = require('nforce');
const fs = require('fs');
const Kafka = require('no-kafka');
const faye = require('faye');
const { time } = require('console');

//This is the fs thing. no-kafka likes its certs in files.
fs.writeFileSync('./client.crt', process.env.KAFKA_CLIENT_CERT);
fs.writeFileSync('./client.key', process.env.KAFKA_CLIENT_CERT_KEY);

//create the Kafka producer for great justice later
const consumer = new Kafka.SimpleConsumer({
    connectionString: process.env.KAFKA_URL,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
});
  
//nforce's authentication to Salesforce org
// const org = nforce.createConnection({
//   clientId: process.env.CLIENTID,
//   clientSecret: process.env.CLIENTSECRET,
//   redirectUri: 'http://localhost:3000/oauth/_callback',
//   environment: process.env.ENVIRONMENT,
//   mode: 'single',
// });

var dataHandler = function (messageSet, topic, partition) {
    messageSet.forEach(function (m) {
        console.log('Message Received:');
        console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
    });
};

return consumer.init().then(() => {
    console.log('Consumer Initiated');

    consumer.subscribe('kafka-test-topic', dataHandler);

});