const functions = require('firebase-functions');
const octwilio = require('./octwilio');
const octopus = require('./octopus');

function convertPayloadToMessage(payload) {
    let message = payload.Event.Message;
    let deploymentId = payload.Event.RelatedDocumentIds.find((id) => id.startsWith("Deployments-"));
    let url = `${payload.ServerUri}/app#/deployments/${deploymentId}`;
    return `${message}\n\nYou can view the deployment at ${url}\n\nReply with either 'Approve' or 'Reject' followed by notes.`;
}

exports.approvalRaised = functions.https.onRequest((req, res) => {
    return octopus.authorizeRequest(req, res)
        .then(octopus.getSubscriptionPayload)
        .then(octwilio.saveApproval)
        .then(convertPayloadToMessage)
        .then(octwilio.sendTwilioMessage)
        .then(() => { return res.status(200).send(); });
});
