const functions = require('firebase-functions');
const octwilio = require('./octwilio');
const octopus = require('./octopus');

const config = octwilio.config;

function convertPayloadToOptions(payload) {
    let message = payload.Event.Message;
    let deploymentId = payload.Event.RelatedDocumentIds.find((id) => id.startsWith("Deployments-"));
    let url = `${payload.ServerUri}/app#/deployments/${deploymentId}`;

    let options = {
        message: `${message}\n\nYou can view the deployment at ${url}\n\nReply with either 'Approve' or 'Reject' followed by notes.`,
        toNumber: config.twilio.approval.to_number,
        fromNumber: config.twilio.approval.fromNumber
    }

    return options;
}

exports.approvalRaised = functions.https.onRequest((req, res) => {
    return octopus.authorizeRequest(req, res)
        .then(octopus.getSubscriptionPayload)
        .then(octwilio.saveApproval)
        .then(convertPayloadToOptions)
        .then(octwilio.sendTwilioMessage)
        .then(() => { return res.status(200).send(); });
});
