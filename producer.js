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
    const produceTopicName = topic || process.env.KAFKA_PRODUCE_TOPIC;
    
    producer
        .send({
                topic:`${produceTopicName}`,
                partition: 0,
                message:{
                    value: JSON.stringify(caseObj)
                },
            })
        .then((result) => {
            console.log(`Published to ${produceTopicName} topic`);
            console.log(`Message sent: ${JSON.stringify(caseObj)}`);
            console.log(`Result: ${JSON.stringify(result)}`);
        });
};

producer.init().then(() => {
    console.log('Producer Initiated');
});


module.exports = {
    produceMessage
};