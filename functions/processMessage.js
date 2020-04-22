const functions = require('firebase-functions');
const octwilio = require('./octwilio');
const octopus = require('./octopus');

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

    console.log(options);

    return Promise.resolve(options);
}

function processApproval(from, result, message, response) {
    return octwilio.getApprovalRecord(from)
        .then((approval) => { return createApprovalOptions(approval, result, message); })
        .then(octopus.findInterruption)
        .then(octopus.takeResponsibility)
        .then(octopus.submitInterruption)
        .then(() => { return octwilio.deleteApproval(from); })
        .then(() => { return octwilio.sendTwilioMessage(response); });
}

exports.processMessage = functions.https.onRequest((req, res) => {
    let from = req.body.From;
    let message = req.body.Body;
    let action = null;

    if (message.startsWith("Approve")) {
        action = processApproval(from, "Proceed", message, "Deployment approved.");
    } else if (message.startsWith("Reject")) {
        action = processApproval(from, "Abort", message, "Deployment rejected.");
    }
    else {
        action = octwilio.sendTwilioMessage("Sorry, I didn't understand that. Please try again.");
    }

    return action.then(() => { return res.status(200).send(); });
});
