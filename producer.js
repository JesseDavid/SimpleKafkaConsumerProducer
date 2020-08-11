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
const producer = new Kafka.Producer({
    connectionString: process.env.KAFKA_URL,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
});

const caseObj = {
    'userName': 'Maria Edmunsen',
    'caseDescription': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut gravida lectus sit amet eleifend lobortis. Mauris quis metus eros. Aliquam tristique semper blandit. Suspendisse orci velit, feugiat eu feugiat convallis, imperdiet ac lorem. Morbi sollicitudin, nisl id scelerisque viverra, diam dui egestas sem, et sodales elit purus quis nunc. Etiam eros justo, viverra in sem sit amet, consectetur sodales lacus. Nam non aliquam sapien. Proin lacus sapien, mollis in urna sit amet, mattis sagittis eros. Nulla luctus dui a mollis ultricies. Sed finibus tincidunt volutpat. In tincidunt ut ligula quis molestie. Maecenas vitae fringilla ante. Sed ullamcorper molestie risus, hendrerit fringilla tortor faucibus sed. Quisque vel feugiat mauris.',
    'time': Date.now().toLocaleString
};

return producer.init().then(() => {
    console.log('Producer Initiated');

    console.log(`Sending to Kafka Topic : ${process.env.KAFKA_TOPIC}`);
    console.log(`Message sent: ${JSON.stringify(caseObj)}`);

    producer.send({
        topic:`${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`,
        partition:0,
        message:{
            value: JSON.stringify(caseObj)
        },
    }).then((result) => {
        console.log(`Message sent: ${JSON.stringify(caseObj)}`);
        console.log(result);
    });

});