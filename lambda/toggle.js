const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const eventBridge = new AWS.EventBridge();
  const ruleName = process.env.RULE_NAME;

  const { State } = await eventBridge
    .describeRule({ Name: ruleName })
    .promise();
  console.log(`Current state of ${ruleName}: ${State}`);

  if (State === 'ENABLED') {
    await eventBridge.disableRule({ Name: ruleName }).promise();
    console.log(`Disabled rule: ${ruleName}`);
  } else {
    await eventBridge.enableRule({ Name: ruleName }).promise();
    console.log(`Enabled rule: ${ruleName}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Rule ${ruleName} is now ${State === 'ENABLED' ? 'disabled' : 'enabled'}`,
    }),
  };
};
