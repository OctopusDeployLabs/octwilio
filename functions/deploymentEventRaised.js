const functions = require('firebase-functions');
const octwilio = require('./octwilio');
const octopus = require('./octopus');

const config = octwilio.config;

function convertPayloadToOptions(payload) {
    let options = {
        message: payload.Event.Message,
        toNumber: config.twilio.deployment.to_number,
        fromNumber: config.twilio.deployment.fromNumber
    }

    return options;
}

exports.deploymentEventRaised = functions.https.onRequest((req, res) => {
    return octopus.authorizeRequest(req, res)
        .then(octopus.getSubscriptionPayload)
        .then(convertPayloadToOptions)
        .then(octwilio.sendTwilioMessage)
        .then(() => { return res.status(200).send(); });
});
