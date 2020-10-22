# This is a dead-simple Kafka Producer

Goal of this is to be able to hook up a code repo via github to Heroku, deploy a Kafka cluster there, hit deploy, and start pumping messages in.

By the end of my dev on this you should be able to, *in a UI*:
1. Specify a Kafka topic to send messages to
2. Write down super simple messages in JSON format
3. Hit a button to get that info into Heroku Kafka

## Required Env Variables

**SF_API_USERNAME** Username from the Salesforce connected app

**SF_API_PASSWORD** Password from the Salesforce connected app

**SF_LOGIN_URL** Salesforce login url (usually https://login.salesforce.com)

**KAFKA_SUBSCRIBE_TOPIC** The topic name that the subscriber will listen to

**KAFKA_PRODUCE_TOPIC** The topic nane the producer will produce to