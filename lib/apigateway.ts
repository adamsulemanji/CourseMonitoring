import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ApiGatewayConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    lambdaFunction: lambda.Function[],
    userPool: cognito.UserPool,
  ) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'CourseMonitoringAPIGateway', {
      restApiName: 'CourseMonitoringAPIGateway',
      description: 'APIGateway for Course Monitoring System',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // Create Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CourseMonitoringAuthorizer',
      {
        cognitoUserPools: [userPool],
      },
    );

    const users = api.root.addResource('users');
    users.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    users.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    const userUUID = users.addResource('{uuid}');
    userUUID.addMethod(
      'GET',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    userUUID.addMethod(
      'PATCH',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    userUUID.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    const Usersclases = userUUID.addResource('classes');
    Usersclases.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );
    const userClassDelete = Usersclases.addResource('{classId}');
    userClassDelete.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(lambdaFunction[0]),
      {
        authorizer,
      },
    );

    const scrape = api.root.addResource('scrape');
    scrape.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaFunction[1]),
      {
        authorizer,
      },
    );

    const toggle = api.root.addResource('toggle');
    toggle.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lambdaFunction[2]),
      {
        authorizer,
      },
    );
  }
}
