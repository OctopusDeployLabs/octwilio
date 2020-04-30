const rp = require('request-promise');
const octwilio = require('./octwilio');

let config = octwilio.config;
let headers = {
    'X-Octopus-ApiKey': config.octopus.apikey
};

exports.authorizeRequest = function (req) {
    const providedToken = req.get('octwilio-token');
    const token = config.octopus.token;

    if (!providedToken || providedToken !== token) {
        return Promise.reject({
            code: 401,
            message: 'Missing or invalid token'
        });
    }

    return Promise.resolve(req);
};

exports.findInterruption = function (options) {
    let octopusUri = `${options.serverUri}\\api\\${options.spaceId}\\interruptions?regarding=${options.serverTaskId}`;
    const requestOptions = {
        method: 'GET',
        uri: octopusUri,
        json: true,
        headers: headers
    }

    return rp(requestOptions).then((results) => {
        let interruption = results.Items[0];

        options.interruption = interruption;

        return options;
    });
};

exports.getSubscriptionPayload = function (req) {
    const payload = req.body.Payload;

    if (payload) {
        return Promise.resolve(payload);
    }

    return Promise.reject({
        code: 400,
        message: 'No payload provided'
    });
};

exports.submitInterruption = function (options) {
    let interruption = options.interruption;

    let octopusUri = `${options.serverUri}/api/${options.spaceId}/interruptions/${interruption.Id}/submit`;
    const requestOptions = {
        method: 'POST',
        uri: octopusUri,
        json: true,
        headers: headers,
        body: {
            Notes: options.message,
            Result: options.result
        }
    }

    return rp(requestOptions).then(() => {
        return true;
    });
};

exports.takeResponsibility = function (options) {
    let interruption = options.interruption;

    let octopusUri = `${options.serverUri}/api/${options.spaceId}/interruptions/${interruption.Id}/responsible`;
    const requestOptions = {
        method: 'PUT',
        uri: octopusUri,
        json: true,
        headers: headers
    }

    return rp(requestOptions).then(() => {
        return options;
    });
};
