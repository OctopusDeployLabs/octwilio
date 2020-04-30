const admin = require('firebase-admin');
const functions = require('firebase-functions');
const twilio = require('twilio');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();
let config = functions.config().octwilio;
let client = new twilio(config.twilio.account_sid, config.twilio.auth_token);

exports.db = db;
exports.config = config;

exports.deleteApproval = function (key) {
    return db.collection('approvals').doc(key).delete();
};

exports.getApprovalRecord = function (from) {
    return db.collection('approvals').doc(from).get().then((doc) => {
        if (!doc.exists) {
            console.log("Cannot find document for " + from);
        } else {
            approval = doc.data();
            console.log(approval);
        }

        return approval;
    })
};

exports.saveApproval = function (payload) {
    return db.collection('approvals').doc(config.twilio.approval.to_number).set(payload)
        .then(() => {
            return payload;
        });
};

exports.sendTwilioMessage = function (options) {
    return client.messages.create({
        body: options.message,
        to: config.twilio.approval.to_number,
        from: config.twilio.approval.from_number
    }).then((message) => console.log(message.sid));
};
