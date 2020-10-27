# This is a dead-simple Kafka & SF Platform Events Consumer & Producer

Goal of this is to be able to hook up a code repo via github to Heroku, deploy a Kafka cluster there, hit deploy, set up a Salesforce Connected app, and start pumping messages in. 

## Setup

### Heroku Setup

1. Create a new Heroku app
2. Provision a `Basic` tier kafka plan
3. Provision any other add-ons you deem necessary to troubleshoot (I recommend at least a logging one)
4. Connect your app to `https://github.com/JesseDavid/SimpleKafkaConsumerProducer` (or preferrably your own fork of the repo)
5. Deploy that app
6. Create two new Kafka topics, one for the "inbound" messages, one for the "outbound" messages
7. Add in the required environment variables (see below for what they all mean & examples)

### Salesforce Setup

1. Set up a new or connect to an existing Salesforce sandbox/dev org/prod/whatever org you want to hit this with 
2. Create a new Platform Event to represent the inbound events to Salesforce, note the name *and the schema*
3. Create a new Platform Event to represent the outbound events coming from Salesforce, note the name *and the schema*. *NOTE the payload of this will be what eventually shows up in Kafka, so be smart about it*
4. Create a new Connected App with username/password style of authentication. Note the username/password of this
5. Set up whatever mechanism you want to in Salesforce to show that the inbound Platform Event has successfully registered
6. Set up some kind of flow, trigger, button, etc to generate that outbound Platform Event you set up in step 3.


### Full Flow Validation

#### Inbound

0. Set up everything...
1. Open the Heroku logs  `heroku logs -t -a YOURHEROKUAPP`
2. Open whatever screen(s) you need in Salesforce to validate the inbound message was received.
3. Send an API request to Heroku, with a payload that matches the schema the inbound Salesforce Platform event expects (see Salesforce Setup step 2 and the attached Postman collection for an example)
4. In the Heroku logs, validate the API request was received, a Kafka message was published to the correct Kafka topic, and a Platform Event was generated
5. Flip back to that Salesforce screen and validate the Platform Event brought over the information you expected.
6. Profit - $$$

#### Outbound

0. Set up everything...
1. Open the Heroku logs  `heroku logs -t -a YOURHEROKUAPP`
2. Open whatever screen(s)/flows/etc you created in Salesforce to generate the Platform Event
3. Generate that event
4. Flip over to the Heroku logs to validate the Platform Event was received, Heroku parsed it, and put it on the correct Kafka topic
5. Profit - $$$

## Flows

### Inbound (API Call -> Kafka Message -> SF Platform Event)

The "putting a message into Kafka, then PE" service works by:
1. Receiving a POST call to `https://<HEROKUAPPNAME>.herokuapp.com/inbound` with whatever valid json payload you decide on
2. Translating the payload into a message to be put on the `KAFKA_PRODUCE_TOPIC` topic
3. Putting it on the topic specified by the `INBOUND_TOPIC` environment variable
4. Logging the result
5. Taking the **raw payload** and creating a SF Platform Event (based on the `SF_INBOUND_EVENT_NAME` environment variable)

### Outbound (SF Platform Event -> Heroku Listener -> Kafka Message)

The "having a platform event generate a new message in Kafka" service works by:
0. Spinning up a listener to the Salesforce Event topic specified by `SF_EVENT_BUS_URL`
1. Finding a message posted to the event bus, it logs the message...
2. Translates the raw payload of the message to the `OUTBOUND_TOPIC` topic in Kafka
*(this flow is pretty simple)*


## Required Env Variables

**SF_API_USERNAME** Username from the Salesforce connected app

**SF_API_PASSWORD** Password from the Salesforce connected app

**SF_LOGIN_URL** Salesforce login url (usually `https://login.salesforce.com`)

**INBOUND_TOPIC** The topic name a message coming from an external (non SF) system will publish to. This is the topic a subscriber will listen to to push messages into Salesforce. Think of it holding all the information on External -> Kafka -> SF messages.

**OUTBOUND_TOPIC** The topic name a listener to the SF Plat Event bus will publish it's messages to. Think of it as what's holding all the SF -> Kafka messages.

**SF_EVENT_BUS_URL** The url *suffix* of the Salesforce Event bus topic the SF bus lisener should subscribe to. For example: `/event/Case_Event_Outbound__e`.

**SF_INBOUND_EVENT_NAME** The name of the Platform Event to trigger when a new message is found on the `INBOUND_TOPIC` Kafka topic. For example: `Case_Event_Inbound__e`. 