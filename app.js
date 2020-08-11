//Yer standard includes. Nforce for SF Auth, Faye for cometD, no-kafka for yes-kafka, and fs for a thing.
const nforce = require('nforce');
const fs = require('fs');
const Kafka = require('no-kafka');
const faye = require('faye');

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
  
//nforce's authentication to Salesforce org
const org = nforce.createConnection({
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  redirectUri: 'http://localhost:3000/oauth/_callback',
  environment: process.env.ENVIRONMENT,
  mode: 'single',
});

return producer.init().then( ()=> {
    console.log('Producer Initiated');

    console.log(`Sending to Kafka Topic : ${process.env.KAFKA_TOPIC}`);
    producer.send({
        topic:`${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`,
        partition:0,
        message:{
            value: 'THIS IS A PAYLOAD'
        },
    }).then((result) => {
        console.log(result);
    });

});

//Init the Producer, then auth the org, then subscribe to the channel, then on every message, victory.
return producer.init().then(function(){
    console.log('Producer Initiated');
    org.authenticate({username: process.env.SFDCUSERNAME, password: process.env.SFDCPASSWORD}, function(err, resp){
        if(!err){
            console.log('SFDC Auth Connected');
            console.log(`attempting client at ${org.oauth.instance_url}/cometd/45.0/`);
            var fClient = new faye.Client(`${org.oauth.instance_url}/cometd/45.0/`);
            fClient.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
            fClient.subscribe(`${process.env.SF_CHANNEL}`, function(message){
                console.log('Message Received');
                //console.log(message.payload);
                console.log(`Sending to Kafka Topic : ${process.env.KAFKA_TOPIC}`);
                producer.send({
                    topic:`${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`,
                    partition:0,
                    message:{
                        value: JSON.stringify(message.payload)
                    },
                }).then(function(result){
                    console.log(result);
                });
            });
        } else{
            console.error(err);
        }
    });
});