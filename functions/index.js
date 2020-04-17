const functions = require('firebase-functions');
const twilio = require('twilio');

function authorizeRequest(req) {
    const providedToken = req.get('octwilio-token');
    const token = functions.config().octwilio.octopus.token;

    if (!providedToken || providedToken !== token) {
        return Promise.reject({
            code: 401,
            message: 'Missing or invalid token'
        });
    }

    return Promise.resolve(req);
}

function getPayload(req) {
    const payload = req.body.Payload;

    if (payload) {
        console.log(payload);
        return Promise.resolve(payload);
    }

    return Promise.reject({
        code: 400,
        message: 'No payload provided'
    });
}

function sendTwilioMessage() {
    let config = functions.config().octwilio;
    let client = new twilio(config.twilio.account_sid, config.twilio.auth_token);

    return client.messages.create({
        body: 'An approval is required',
        to: config.twilio.approval.to_number,
        from: config.twilio.approval.from_number
    }).then((message) => console.log(message.sid));
}

exports.approvalRaised = functions.https.onRequest((req, res) => {
    return authorizeRequest(req, res)
        .then(getPayload)
        .then(sendTwilioMessage)
        .then(() => { return res.status(200).send(); });
});
