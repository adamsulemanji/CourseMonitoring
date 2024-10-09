const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  ScanCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { randomUUID: AWS_util_uuid_v4 } = require('crypto');

const ddbClient = new DynamoDBClient({});
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const handler = async (event) => {
  const method = event.httpMethod;
  const resource = event.resource;
  const pathParameters = event.pathParameters || '';
  const body = event.body;

  const userTable = process.env.USERS_TABLE_NAME;
  const classTable = process.env.CLASSES_TABLE_NAME;

  console.log('Event:', event);
  console.log('Method:', method);
  console.log('Resource:', resource);
  console.log('Path Parameters:', pathParameters);
  console.log('Body:', body);
  console.log('User Table:', userTable);
  console.log('Class Table:', classTable);

  try {
    if (method == 'POST' && resource == '/users') {
      const { email } = JSON.parse(body);
      const params = {
        TableName: userTable,
        Item: {
          userId: { S: AWS_util_uuid_v4() },
          email: { S: email },
          classes: { L: [] },
        },
      };
      await ddbClient.send(new PutItemCommand(params));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'New User Created',
        }),
      };
    } else if (method == 'GET' && resource == '/users') {
      const params = {
        TableName: userTable,
      };
      const { Items } = await ddbClient.send(new ScanCommand(params));
      const users = Items.map((item) => unmarshall(item));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          users: users,
        }),
      };
    } else if (method == 'DELETE' && resource == '/users/{uuid}') {
      const params = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
      };
      await ddbClient.send(new DeleteItemCommand(params));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'User Deleted',
        }),
      };
    } else if (method == 'PATCH' && resource == '/users/{uuid}') {
      const { classId } = JSON.parse(body);
      const userParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
      };
      const { Item } = await ddbClient.send(new GetItemCommand(userParams));
      const user = unmarshall(Item);
      user.classes.push(classId);
      const updateUserParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
        UpdateExpression: 'SET classes = :c',
        ExpressionAttributeValues: {
          ':c': { L: user.classes.map((c) => ({ S: c })) },
        },
      };
      await ddbClient.send(new UpdateItemCommand(updateUserParams));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'User Updated',
        }),
      };
    } else if (method == 'GET' && resource == '/users/{uuid}') {
      const userParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
      };
      const { Item } = await ddbClient.send(new GetItemCommand(userParams));
      const user = unmarshall(Item);
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          user: user,
        }),
      };
    } else if (method == 'DELETE' && resource == '/users/{uuid}/classes') {
      const userParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
      };
      const { Item } = await ddbClient.send(new GetItemCommand(userParams));
      const user = unmarshall(Item);
      user.classes = [];
      const updateUserParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
        UpdateExpression: 'SET classes = :c',
        ExpressionAttributeValues: {
          ':c': { L: [] },
        },
      };
      await ddbClient.send(new UpdateItemCommand(updateUserParams));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'User Updated',
        }),
      };
    } else if (
      method == 'DELETE' &&
      resource == '/users/{uuid}/classes/{classId}'
    ) {
      const userParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
      };
      const { Item } = await ddbClient.send(new GetItemCommand(userParams));
      const user = unmarshall(Item);
      user.classes = user.classes.filter((c) => c !== pathParameters.classId);
      const updateUserParams = {
        TableName: userTable,
        Key: {
          userId: { S: pathParameters.uuid },
        },
        UpdateExpression: 'SET classes = :c',
        ExpressionAttributeValues: {
          ':c': { L: user.classes.map((c) => ({ S: c })) },
        },
      };
      await ddbClient.send(new UpdateItemCommand(updateUserParams));
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'User Updated',
        }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        message: 'An error occurred {}'.format(error),
      }),
    };
  }
};

module.exports = { handler };
