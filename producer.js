//Yer standard includes. Nforce for SF Auth, Faye for cometD, no-kafka for yes-kafka, and fs for a thing.
const fs = require('fs');
const Kafka = require('no-kafka');

//This is the fs thing. no-kafka likes its certs in files.
fs.writeFileSync('./client.crt', process.env.KAFKA_CLIENT_CERT);
fs.writeFileSync('./client.key', process.env.KAFKA_CLIENT_CERT_KEY);

//create the Kafka producer for great justice later
const producer = new Kafka.Producer({
    connectionString: process.env.KAFKA_URL,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
});

const refCaseObj = {
    'CaseOrigin__c': 'Kafka Producer',
    'Description__c': 'I can\'t seem to log in to the portal',
    'Priority__c': 'Medium',
    'Status__c': 'New',
    'Subject__c': 'Unable to connect.',
    'Contact__c': 'Jordan Ramachandiran'
};

const produceMessage = (caseObj, topic) => {
    const topicSuffix = topic || process.env.KAFKA_TOPIC;
    
    producer
        .send({
                topic:`${process.env.KAFKA_PREFIX}${topicSuffix}`,
                partition: 0,
                message:{
                    value: JSON.stringify(caseObj)
                },
            })
        .then((result) => {
            console.log(`Message sent: ${JSON.stringify(caseObj)}`);
            console.log(result);
        });
};

producer.init().then(() => {
    console.log('Producer Initiated');

    console.log(`Sending to Kafka Topic : ${process.env.KAFKA_TOPIC}`);
    console.log(`Message sent: ${JSON.stringify(refCaseObj)}`);

    producer.send({
        topic:`${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`,
        partition:0,
        message:{
            value: JSON.stringify(refCaseObj)
        },
    }).then((result) => {
        console.log(`Message sent: ${JSON.stringify(refCaseObj)}`);
        console.log(result);
    });

});


module.exports = {
    produceMessage
};