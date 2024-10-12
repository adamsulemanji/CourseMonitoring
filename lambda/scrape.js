const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  ScanCommand,
  DeleteItemCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { randomUUID: generateUUID } = require('crypto');
const cheerio = require('cheerio');
const moment = require('moment');
const request = require('axios');

const dynamoDbClient = new DynamoDBClient({});
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const resourcePath = event.resource;
  const pathParams = event.pathParameters || {};
  const requestBody = event.body ? JSON.parse(event.body) : {};

  const userTableName = process.env.USERS_TABLE_NAME;
  const classTableName = process.env.CLASSES_TABLE_NAME;

  console.log('Event:', event);

  const params = {
    TableName: classTableName,
  };
  const command = new ScanCommand(params);
  const { Items: classes } = await dynamoDbClient.send(command);

  console.log('Classes:', classes);

  for (const c of classes) {
    const { classId, crn, year, semester, prevNotified, seatsOpened, userId } =
      unmarshall(c);

    const { data } = await request.get(url);
    const $ = cheerio.load(data);
    const open = $('.open').length > 0;

    const updateParams = {
      TableName: classTableName,
      Key: {
        classId: { S: classId },
      },
      UpdateExpression: 'SET #open = :open',
      ExpressionAttributeNames: {
        '#open': 'open',
      },
      ExpressionAttributeValues: {
        ':open': { BOOL: open },
      },
    };
    const updateCommand = new UpdateItemCommand(updateParams);
    await dynamoDbClient.send(updateCommand);

    if (open) {
      const query = {
        TableName: userTableName,
        IndexName: 'classIdIndex',
        KeyConditionExpression: 'classId = :classId',
        ExpressionAttributeValues: {
          ':classId': { S: classId },
        },
      };
      const queryCommand = new QueryCommand(query);
      const { Items: users } = await dynamoDbClient.send(queryCommand);

      for (const u of users) {
        const { email } = unmarshall(u);
      }
    }
  }

  return {
    statusCode: 200,
    headers: responseHeaders,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
    }),
  };
};

function urlBuilder(crn, year, semester) {
  return `https://compass-ssb.tamu.edu/pls/PROD/bwykschd.p_disp_detail_sched?term_in=${year}${semester}1&crn_in=${crn}`;
}

module.exports = { handler };
