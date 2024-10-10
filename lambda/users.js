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
  const pathParameters = event.pathParameters || {};
  const body = event.body ? JSON.parse(event.body) : {};

  const userTable = process.env.USERS_TABLE_NAME;
  const classTable = process.env.CLASSES_TABLE_NAME;

  console.log('Event:', event);

  try {
    switch (true) {
      case method === 'POST' && resource === '/users':
        if (!body.email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Email is required' }),
          };
        }
        const createUserParams = {
          TableName: userTable,
          Item: {
            userId: { S: AWS_util_uuid_v4() },
            email: { S: body.email },
            classes: { L: [] },
          },
        };
        await ddbClient.send(new PutItemCommand(createUserParams));
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ message: 'New User Created' }),
        };

      case method === 'GET' && resource === '/users':
        const scanParams = { TableName: userTable };
        const { Items } = await ddbClient.send(new ScanCommand(scanParams));
        const users = Items.map((item) => unmarshall(item));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ users }),
        };

      case method === 'GET' && resource === `/users/{uuid}`:
        const getUserParams = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        const { Item } = await ddbClient.send(
          new GetItemCommand(getUserParams),
        );
        if (!Item) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: unmarshall(Item) }),
        };

      case method === 'PATCH' && resource === `/users/{uuid}`:
        const { crn, year, semester } = body;

        // Validation to ensure all required fields are present
        if (!crn || !year || !semester) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              message: 'CRN, year, and semester are required',
            }),
          };
        }

        const getUserToUpdateParams = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        const { Item: userItem } = await ddbClient.send(
          new GetItemCommand(getUserToUpdateParams),
        );

        if (!userItem) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const classId = AWS_util_uuid_v4();
        const classParams = {
          TableName: classTable,
          Item: {
            classId: { S: classId },
            crn: { S: crn }, // CRN is treated as a string
            year: { N: year.toString() }, // Ensure year is a number
            semester: { N: mapSemester(semester).toString() }, // Ensure semester is a number
            userId: { S: pathParameters.uuid }, // UserId is a string
          },
        };

        await ddbClient.send(new PutItemCommand(classParams));

        const userToUpdate = unmarshall(userItem);
        userToUpdate.classes.push(classId); // Add the new classId to the user's class list

        const updateUserParams = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
          UpdateExpression: 'SET classes = :c',
          ExpressionAttributeValues: {
            ':c': { L: userToUpdate.classes.map((c) => ({ S: c })) }, // Ensure class list is an array of strings
          },
        };

        await ddbClient.send(new UpdateItemCommand(updateUserParams));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'User Updated' }),
        };

      case method === 'DELETE' && resource === `/users/{uuid}/classes`:
        const getUserParamsForDelete = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        const { Item: userForDelete } = await ddbClient.send(
          new GetItemCommand(getUserParamsForDelete),
        );
        if (!userForDelete) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const getClassesForUserParams = {
          TableName: classTable,
          FilterExpression: 'userId = :u',
          ExpressionAttributeValues: { ':u': { S: pathParameters.uuid } },
        };
        const { Items: classesForUser } = await ddbClient.send(
          new ScanCommand(getClassesForUserParams),
        );

        const deleteClassesPromises = classesForUser.map((c) => {
          const deleteClassParams = {
            TableName: classTable,
            Key: { classId: c.classId },
          };
          return ddbClient.send(new DeleteItemCommand(deleteClassParams));
        });
        await Promise.all(deleteClassesPromises);

        // empty the classes array for the user
        const updateUserParamsForDelete = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
          UpdateExpression: 'SET classes = :c',
          ExpressionAttributeValues: { ':c': { L: [] } },
        };
        await ddbClient.send(new UpdateItemCommand(updateUserParamsForDelete));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'User Deleted' }),
        };

      case method === 'DELETE' && resource === `/users/{uuid}/`:
        // get a user by id, then delete the classes associated with that user, then delete the user
        const getUserParamsForDelete2 = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        const { Item: userForDelete2 } = await ddbClient.send(
          new GetItemCommand(getUserParamsForDelete2),
        );
        if (!userForDelete2) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const getClassesForUserParams2 = {
          TableName: classTable,
          FilterExpression: 'userId = :u',
          ExpressionAttributeValues: { ':u': { S: pathParameters.uuid } },
        };
        const { Items: classesForUser2 } = await ddbClient.send(
          new ScanCommand(getClassesForUserParams2),
        );

        const deleteClassesPromises2 = classesForUser2.map((c) => {
          const deleteClassParams2 = {
            TableName: classTable,
            Key: { classId: c.classId },
          };
          return ddbClient.send(new DeleteItemCommand(deleteClassParams2));
        });
        await Promise.all(deleteClassesPromises2);

        const deleteUserParams = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        await ddbClient.send(new DeleteItemCommand(deleteUserParams));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'User Deleted' }),
        };

      case method === 'DELETE' &&
        resource === `/users/{uuid}/classes/{classId}`:
        // get the user by id, then delete the class by id, then remove the class id from the array of classes for the user
        const getUserParamsForDelete3 = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
        };
        const { Item: userForDelete3 } = await ddbClient.send(
          new GetItemCommand(getUserParamsForDelete3),
        );
        if (!userForDelete3) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const getClassParamsForDelete = {
          TableName: classTable,
          Key: { classId: { S: pathParameters.classId } },
        };

        const { Item: classForDelete } = await ddbClient.send(
          new GetItemCommand(getClassParamsForDelete),
        );
        if (!classForDelete) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Class not found' }),
          };
        }

        await ddbClient.send(new DeleteItemCommand(getClassParamsForDelete));

        const userForDelete4 = unmarshall(userForDelete3);
        userForDelete3.classes = userForDelete4.classes.filter(
          (c) => c !== pathParameters.classId,
        );
        const updateUserParamsForDelete3 = {
          TableName: userTable,
          Key: { userId: { S: pathParameters.uuid } },
          UpdateExpression: 'SET classes = :c',
          ExpressionAttributeValues: {
            ':c': { L: userForDelete4.classes.map((c) => ({ S: c })) },
          },
        };
        await ddbClient.send(new UpdateItemCommand(updateUserParamsForDelete3));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Class Deleted' }),
        };

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Route not found' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: `An error occurred: ${error.message}` }),
    };
  }
};

function mapSemester(semester) {
  switch (semester) {
    case 'Spring':
      return 1;
    case 'Summer':
      return 2;
    case 'Fall':
      return 3;
    default:
      return 0;
  }
}

module.exports = { handler };
