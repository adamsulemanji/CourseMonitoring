import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class LambdaConstruct extends Construct {
  public readonly users: lambda.Function;
  public readonly classes: lambda.Function;
  public readonly scrape: lambda.Function;
  public readonly toggle: lambda.Function;

  constructor(scope: Construct, id: string, dynamos: dynamodb.Table[]) {
    super(scope, id);

    // ******* Get the DynamoDB table name *******
    const usersTableName = dynamos[0].tableName;
    const classesTableName = dynamos[1].tableName;

    // ********** Lambda for users **********
    this.users = new lambda.Function(this, 'UsersLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'users.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        USERS_TABLE_NAME: usersTableName,
      },
    });

    // ********** Lambda for classes **********
    this.classes = new lambda.Function(this, 'ClassesLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'classes.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        CLASSES_TABLE_NAME: classesTableName,
      },
    });

    // ********** Lambda for EventBridge rule **********
    this.scrape = new lambda.Function(this, 'ScrapeLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'scrape.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    // ********** Lambda for toggling the EventBridge rule **********
    this.toggle = new lambda.Function(this, 'ToggleLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'toggle.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    // Environment variables for the Lambda function each table
    this.users.addEnvironment('USERS_TABLE_NAME', usersTableName);
    this.users.addEnvironment('CLASSES_TABLE_NAME', classesTableName);

    this.classes.addEnvironment('USERS_TABLE_NAME', usersTableName);
    this.classes.addEnvironment('CLASSES_TABLE_NAME', classesTableName);

    this.scrape.addEnvironment('CLASSES_TABLE_NAME', classesTableName);
    this.scrape.addEnvironment('USERS_TABLE_NAME', usersTableName);
  }
}
