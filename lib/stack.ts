import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './ddb';
import { FrontendConstruct } from './cloudfront';
import { EventConstruct } from './eventbridge';
import { CognitoConstruct } from './cognito';

export class CourseMonitoring3Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ******** Create DynamoDB tables ********
        const dynamoDbConstruct = new DynamoDBConstruct(
            this,
            'DynamoDBConstruct'
        );

        // ******** Create Cognito User Pool ********
        const cognitoConstruct = new CognitoConstruct(this, 'CognitoConstruct');

        // ******** Create Lambda Functions ********
        const lambdaConstruct = new LambdaConstruct(this, 'LambdaConstruct', [
            dynamoDbConstruct.userTable,
            dynamoDbConstruct.classTable,
        ]);

        // ******** Create Event Bridge Rule ********
        const eventBridgeConstruct = new EventConstruct(
            this,
            'EventConstruct',
            lambdaConstruct.scrape
        );
        lambdaConstruct.toggle.addEnvironment(
            'RULE_NAME',
            eventBridgeConstruct.eventRule.ruleName
        );

        // ******** Create API Gateway ********
        new ApiGatewayConstruct(
            this,
            'ApiGatewayConstruct',
            [
                lambdaConstruct.users,
                lambdaConstruct.scrape,
                lambdaConstruct.toggle,
            ],
            cognitoConstruct.userPool
        );

        // ********** Frontend Construct **********
        new FrontendConstruct(this, 'FrontendConstruct');

        // ********** Grant Permissions through IAM policies and Roles **********
        dynamoDbConstruct.userTable.grantFullAccess(lambdaConstruct.users);
        dynamoDbConstruct.classTable.grantFullAccess(lambdaConstruct.users);
        lambdaConstruct.toggle.addToRolePolicy(
            new iam.PolicyStatement({
                actions: [
                    'events:DescribeRule',
                    'events:EnableRule',
                    'events:DisableRule',
                ],
                resources: [eventBridgeConstruct.eventRule.ruleArn],
            })
        );
    }
}
