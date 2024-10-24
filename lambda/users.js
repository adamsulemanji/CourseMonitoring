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

  try {
    switch (true) {
      case httpMethod === 'POST' && resourcePath === '/users':
        if (!requestBody.email) {
          return {
            statusCode: 400,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'Email is required' }),
          };
        }

        const UUID = generateUUID();
        const createUserParams = {
          TableName: userTableName,
          Item: {
            userId: { S: UUID },
            email: { S: requestBody.email },
            phone: { S: requestBody.phone || '' },
            classes: { L: [] },
          },
        };
        await dynamoDbClient.send(new PutItemCommand(createUserParams));
        return {
          statusCode: 201,
          headers: responseHeaders,
          body: JSON.stringify({ 
            message: 'New User Created',
            userId: UUID,
          }),
        };

      case httpMethod === 'GET' && resourcePath === '/users':
        const scanUsersParams = { TableName: userTableName };
        const { Items: usersData } = await dynamoDbClient.send(
          new ScanCommand(scanUsersParams),
        );
        const users = usersData.map((item) => unmarshall(item));
        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({ users }),
        };

      case httpMethod === 'GET' && resourcePath === '/users/{uuid}':
        const getUserParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
        };
        const { Item: userItem } = await dynamoDbClient.send(
          new GetItemCommand(getUserParams),
        );
        if (!userItem) {
          return {
            statusCode: 404,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }
        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({ user: unmarshall(userItem) }),
        };

      case httpMethod === 'PATCH' && resourcePath === '/users/{uuid}':
        const { crn, year, semester } = requestBody;

        if (!crn || !year || !semester) {
          return {
            statusCode: 400,
            headers: responseHeaders,
            body: JSON.stringify({
              message: 'CRN, year, and semester are required',
            }),
          };
        }

        const getUserToUpdateParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
        };
        const { Item: userToUpdateItem } = await dynamoDbClient.send(
          new GetItemCommand(getUserToUpdateParams),
        );

        if (!userToUpdateItem) {
          return {
            statusCode: 404,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const classId = generateUUID();
        const createClassParams = {
          TableName: classTableName,
          Item: {
            classId: { S: classId },
            crn: { S: crn },
            year: { N: year.toString() },
            semester: { N: mapSemester(semester).toString() },
            prevNotified: { BOOL: false },
            seatsOpened: { BOOL: false },
            userId: { S: pathParams.uuid },
          },
        };

        await dynamoDbClient.send(new PutItemCommand(createClassParams));

        const updatedUser = unmarshall(userToUpdateItem);
        updatedUser.classes.push(classId);

        const updateUserParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
          UpdateExpression: 'SET classes = :classes',
          ExpressionAttributeValues: {
            ':classes': { L: updatedUser.classes.map((c) => ({ S: c })) },
          },
        };

        await dynamoDbClient.send(new UpdateItemCommand(updateUserParams));

        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({ message: 'User Updated' }),
        };

      case httpMethod === 'DELETE' && resourcePath === '/users/{uuid}/classes':
        const queryClassesParams = {
          TableName: classTableName,
          IndexName: 'userId-index',
          KeyConditionExpression: 'userId = :userUuid',
          ExpressionAttributeValues: {
            ':userUuid': { S: pathParams.uuid },
          },
        };

        const { Items: userClasses } = await dynamoDbClient.send(
          new QueryCommand(queryClassesParams),
        );

        const deleteClassesPromises = userClasses.map((classItem) => {
          const deleteClassParams = {
            TableName: classTableName,
            Key: {
              classId: { S: classItem.classId.S },
              userId: { S: pathParams.uuid },
            },
          };
          return dynamoDbClient.send(new DeleteItemCommand(deleteClassParams));
        });

        await Promise.all(deleteClassesPromises);

        const clearUserClassesParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
          UpdateExpression: 'SET classes = :emptyClassList',
          ExpressionAttributeValues: { ':emptyClassList': { L: [] } },
        };

        await dynamoDbClient.send(
          new UpdateItemCommand(clearUserClassesParams),
        );

        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({
            message: 'All classes successfully deleted for the user',
          }),
        };

      case httpMethod === 'DELETE' && resourcePath === '/users/{uuid}/':
        const getUserForDeleteParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
        };
        const { Item: userToDelete } = await dynamoDbClient.send(
          new GetItemCommand(getUserForDeleteParams),
        );
        if (!userToDelete) {
          return {
            statusCode: 404,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const scanClassesForUserParams = {
          TableName: classTableName,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': { S: pathParams.uuid } },
        };
        const { Items: userClassesToDelete } = await dynamoDbClient.send(
          new ScanCommand(scanClassesForUserParams),
        );

        const deleteClassPromises = userClassesToDelete.map((classItem) => {
          const deleteClassParams = {
            TableName: classTableName,
            Key: { classId: classItem.classId },
          };
          return dynamoDbClient.send(new DeleteItemCommand(deleteClassParams));
        });
        await Promise.all(deleteClassPromises);

        const deleteUserParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
        };
        await dynamoDbClient.send(new DeleteItemCommand(deleteUserParams));

        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({ message: 'User Deleted' }),
        };

      case httpMethod === 'DELETE' &&
        resourcePath === '/users/{uuid}/classes/{classId}':
        const getClassParamsForDelete = {
          TableName: classTableName,
          Key: {
            classId: { S: pathParams.classId },
            userId: { S: pathParams.uuid },
          },
        };

        const { Item: classToDelete } = await dynamoDbClient.send(
          new GetItemCommand(getClassParamsForDelete),
        );
        if (!classToDelete) {
          return {
            statusCode: 404,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'Class not found' }),
          };
        }

        await dynamoDbClient.send(
          new DeleteItemCommand(getClassParamsForDelete),
        );

        const getUserForUpdateParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
        };
        const { Item: userForUpdate } = await dynamoDbClient.send(
          new GetItemCommand(getUserForUpdateParams),
        );
        if (!userForUpdate) {
          return {
            statusCode: 404,
            headers: responseHeaders,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const updatedUserForDelete = unmarshall(userForUpdate);
        updatedUserForDelete.classes = updatedUserForDelete.classes.filter(
          (classId) => classId !== pathParams.classId,
        );

        const updateUserClassesParams = {
          TableName: userTableName,
          Key: { userId: { S: pathParams.uuid } },
          UpdateExpression: 'SET classes = :classes',
          ExpressionAttributeValues: {
            ':classes': {
              L: updatedUserForDelete.classes.map((classId) => ({
                S: classId,
              })),
            },
          },
        };

        await dynamoDbClient.send(
          new UpdateItemCommand(updateUserClassesParams),
        );

        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({ message: 'Class Deleted' }),
        };

      default:
        return {
          statusCode: 404,
          headers: responseHeaders,
          body: JSON.stringify({ message: 'Route not found' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
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
