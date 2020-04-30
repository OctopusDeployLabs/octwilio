const { approvalRaised } = require('./approvalRaised');
const { deploymentEventRaised } = require('./deploymentEventRaised');
const { processMessage } = require('./processMessage');

exports.approvalRaised = approvalRaised;
exports.deploymentEventRaised = deploymentEventRaised;
exports.processMessage = processMessage;
