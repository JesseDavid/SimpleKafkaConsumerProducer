const fs = require('fs');
const Kafka = require('no-kafka');

fs.writeFileSync('./client.crt', process.env.KAFKA_CLIENT_CERT);
fs.writeFileSync('./client.key', process.env.KAFKA_CLIENT_CERT_KEY);

//create the Kafka producer
const producer = new Kafka.Producer({
    connectionString: process.env.KAFKA_URL,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
});

// const refCaseObj = {
//     'CaseOrigin__c': 'Kafka Producer',
//     'Description__c': 'I can\'t seem to log in to the portal',
//     'Priority__c': 'Medium',
//     'Status__c': 'New',
//     'Subject__c': 'Unable to connect.',
//     'Contact__c': 'Jordan Ramachandiran'
// };

const produceMessage = (caseObj, topic) => {
    const produceTopicName = topic || process.env.INBOUND_TOPIC;
    
    producer
        .send({
                topic:`${process.env.KAFKA_PREFIX}${produceTopicName}`,
                partition: 0,
                message:{
                    value: JSON.stringify(caseObj)
                },
            })
        .then((result) => {
            console.log(`Published to ${process.env.KAFKA_PREFIX}${produceTopicName} topic`);
            console.log(`Message published: ${JSON.stringify(caseObj, null, 4)}`);
            console.log(`Result from Kafka: ${JSON.stringify(result, null, 4)}`);
        });
};

producer.init().then(() => {
    console.log('Producer Initiated');
});


module.exports = {
    produceMessage
};