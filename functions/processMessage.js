const functions = require('firebase-functions');
const octwilio = require('./octwilio');
const octopus = require('./octopus');

const config = octwilio.config;

function createApprovalOptions(approval, result, message) {
    let relatedDocumentIds = approval.Event.RelatedDocumentIds;
    let serverTaskId = relatedDocumentIds.find((id => id.startsWith('ServerTasks-')));

    let options = {
        message: message,
        result: result,
        serverTaskId: serverTaskId,
        serverUri: approval.ServerUri,
        spaceId: approval.Event.SpaceId
    }

    return Promise.resolve(options);
}

function processApproval(from, result, message, response) {
    let messageOptions = {
        message: response,
        toNumber: from,
        fromNumber: config.twilio.approval.fromNumber
    };

    return octwilio.getApprovalRecord(from)
        .then((approval) => { return createApprovalOptions(approval, result, message); })
        .then(octopus.findInterruption)
        .then(octopus.takeResponsibility)
        .then(octopus.submitInterruption)
        .then(() => { return octwilio.deleteApproval(from); })
        .then(() => { return octwilio.sendTwilioMessage(messageOptions); });
}

exports.processMessage = functions.https.onRequest((req, res) => {
    let from = req.body.From;
    let to = req.body.To;
    let message = req.body.Body;
    let action = null;

    if (to !== config.twilio.approval.from_number
        && to !== config.twilio.deployment.from_number) {
        return Promise.reject({
            code: 403,
            message: 'Unrecognized number'
        });
    }

    if (message.startsWith("Approve")) {
        action = processApproval(from, "Proceed", message, "Deployment approved.");
    } else if (message.startsWith("Reject")) {
        action = processApproval(from, "Abort", message, "Deployment rejected.");
    }
    else {
        let messageOptions = {
            message: "Sorry, I didn't understand that. Please try again.",
            toNumber: from,
            fromNumber: config.twilio.approval.fromNumber
        };

        action = octwilio.sendTwilioMessage(messageOptions);
    }

    return action.then(() => { return res.status(200).send(); });
});
