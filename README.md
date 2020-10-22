# This is a dead-simple Kafka Producer

Goal of this is to be able to hook up a code repo via github to Heroku, deploy a Kafka cluster there, hit deploy, set up a Salesforce Connected app, and start pumping messages in. 

The "putting a message into Kafka" service works by:
1. Receiving a POST call to https://<HEROKUAPPNAME>.herokuapp.com/inbound with whatever payload you decide on
2. Translating the payload into a message to be put on the `KAFKA_PRODUCE_TOPIC` topic
3. Putting it on the topic
4. Logging the result

By the end of my dev on this you should be able to, *in a UI*:
1. Specify a Kafka topic to send messages to
2. Write down super simple messages in JSON format
3. Hit a button to get that info into Heroku Kafka

## Required Env Variables

**SF_API_USERNAME** Username from the Salesforce connected app

**SF_API_PASSWORD** Password from the Salesforce connected app

**SF_LOGIN_URL** Salesforce login url (usually https://login.salesforce.com)

**INBOUND_TOPIC** The topic name a message coming from an external (non SF) system will publish to. This is the topic a subscriber will listen to to push messages into Salesforce. Think of it holding all the information on External -> Kafka -> SF messages.

**OUTBOUND_TOPIC** The topic name a listener to the SF Plat Event bus will publish it's messages to. Think of it as what's holding all the SF -> Kafka messages.