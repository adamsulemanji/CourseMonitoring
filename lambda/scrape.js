const {
  DynamoDBClient,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const axios = require('axios');
const cheerio = require('cheerio');

const dynamoDbClient = new DynamoDBClient({});
const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const handler = async (event) => {

  console.log('Scrape event:', event);

  try {
    const classTableName = process.env.CLASSES_TABLE_NAME;
    const userTableName = process.env.USERS_TABLE_NAME;

    const classParams = {
      TableName: classTableName,
    };
    const command = new ScanCommand(classParams);
    const { Items: classes } = await dynamoDbClient.send(command);
    const unmarshalledClasses = classes.map((item) => unmarshall(item));

    const scrapePromises = unmarshalledClasses.map((classDocument) =>
      processClass(classDocument, classTableName, userTableName),
    );

    const results = await Promise.all(scrapePromises);

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        message: 'Scraping and notification complete',
        results,
      }),
    };
  } catch (error) {
    console.error('Error during scraping:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'An error occurred while scraping' }),
    };
  }
};

const processClass = async (classDocument, classTableName, userTableName) => {
  try {
    const { classId, crn, year, semester, userId, isOpen, notificationSent } =
      classDocument;

    const url = urlBuilder(crn, year, semester);
    const response = await retryAxiosRequest(url);

    const $ = cheerio.load(response.data);
    const className = $('th.ddlabel').first().text().trim();
    const seatsInfo = extractSeatsInfo($);
    const remainingSeats = Number(seatsInfo['Seats']?.Remaining || 0);

    if (isNaN(remainingSeats)) {
      console.warn(
        `Remaining seats is not a number for class ${classId}. Skipping.`,
      );
      return null;
    }

    const user = await getUser(userId, userTableName);
    if (!user) {
      console.warn(`User not found for class ${classId}. Skipping.`);
      return null;
    }

    const phone = user.phone;
    console.log(
      `Processing class ${className} for user ${userId} with ${remainingSeats} seats remaining.`,
    );

    const shouldUpdateIsOpen =
      (remainingSeats > 0 && !isOpen) || (remainingSeats === 0 && isOpen);
    const shouldUpdateNotification = remainingSeats > 0 && !notificationSent;

    const updateParams = buildUpdateParams(
      classId,
      className,
      remainingSeats,
      isOpen,
      notificationSent,
      classTableName,
      shouldUpdateIsOpen,
      shouldUpdateNotification,
    );

    if (remainingSeats > 0 && !isOpen && !notificationSent) {
      console.log(
        `Sending notification to user ${userId} for class ${className}`,
      );
      await sendSms(phone, className, remainingSeats);
      updateParams.ExpressionAttributeValues[':isOpen'] = { BOOL: true };
      updateParams.ExpressionAttributeValues[':notificationSent'] = {
        BOOL: true,
      };
    } else if (remainingSeats === 0 && isOpen) {
      updateParams.ExpressionAttributeValues[':isOpen'] = { BOOL: false };
      updateParams.ExpressionAttributeValues[':notificationSent'] = {
        BOOL: false,
      };
      console.log(`Class ${className} is now closed. Resetting status.`);
    } else if (remainingSeats > 0 && isOpen && notificationSent) {
      console.log(
        `Class ${className} is still open but notification already sent. Skipping.`,
      );
      return {
        classId,
        className,
        remainingSeats,
        message: 'Notification already sent, no action taken.',
      };
    }

    const updateCommand = new UpdateItemCommand(updateParams);
    await dynamoDbClient.send(updateCommand);

    return { classId, className, remainingSeats };
  } catch (error) {
    console.error(`Error processing class ${classDocument.classId}:`, error);
    return null;
  }
};

const extractSeatsInfo = ($) => {
  const seatsInfo = {};
  $('table.datadisplaytable')
    .eq(1)
    .find('tr')
    .each((index, element) => {
      if (index === 0) return true;

      const type = $(element).find('th.ddlabel').text().trim();
      const capacity = $(element).find('td').eq(0).text().trim();
      const actual = $(element).find('td').eq(1).text().trim();
      const remaining = $(element).find('td').eq(2).text().trim();

      seatsInfo[type] = {
        Capacity: capacity,
        Actual: actual,
        Remaining: remaining,
      };
    });
  return seatsInfo;
};

const getUser = async (userId, userTableName) => {
  try {
    const userQuery = {
      TableName: userTableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    };
    const userCommand = new QueryCommand(userQuery);
    const { Items: userResults } = await dynamoDbClient.send(userCommand);

    if (userResults.length > 0) {
      return unmarshall(userResults[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

const buildUpdateParams = (
  classId,
  className,
  remainingSeats,
  isOpen,
  notificationSent,
  classTableName,
  shouldUpdateIsOpen,
  shouldUpdateNotification,
) => {
  const updateParams = {
    TableName: classTableName,
    Key: { classId: { S: classId } },
    UpdateExpression: 'SET #name = :name, #lastChecked = :lastChecked',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#lastChecked': 'lastChecked',
    },
    ExpressionAttributeValues: {
      ':name': { S: className },
      ':lastChecked': { N: `${Date.now()}` },
    },
  };

  if (shouldUpdateIsOpen) {
    updateParams.UpdateExpression += ', #isOpen = :isOpen';
    updateParams.ExpressionAttributeNames['#isOpen'] = 'isOpen';
    updateParams.ExpressionAttributeValues[':isOpen'] = { BOOL: isOpen };
  }

  if (shouldUpdateNotification) {
    updateParams.UpdateExpression += ', #notificationSent = :notificationSent';
    updateParams.ExpressionAttributeNames['#notificationSent'] =
      'notificationSent';
    updateParams.ExpressionAttributeValues[':notificationSent'] = {
      BOOL: notificationSent,
    };
  }

  return updateParams;
};

const urlBuilder = (crn, year, semester) => {
  return `https://compass-ssb.tamu.edu/pls/PROD/bwykschd.p_disp_detail_sched?term_in=${year}${semester}1&crn_in=${crn}`;
};

const sendSms = (phone, className, remainingSeats) => {
  console.log(
    `Sending SMS to ${phone} for class ${className} with ${remainingSeats} seats remaining`,
  );
};

const retryAxiosRequest = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { timeout: 5000 });
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Request failed. Retrying... Attempt ${i + 1}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

module.exports = { handler };
