import { Construct } from 'constructs'
import * as cognito from 'aws-cdk-lib/aws-cognito'

export class CognitoConstruct extends Construct {
    public readonly userPool: cognito.UserPool
    public readonly userPoolClient: cognito.UserPoolClient

    constructor(scope: Construct, id: string) {
        super(scope, id)

        // ****** Create a Cognito User Pool ******
        this.userPool = new cognito.UserPool(this, 'CourseMonitoringPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            standardAttributes: {
                email: { required: true, mutable: false },
            },
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireUppercase: true,
                requireLowercase: false,
                requireSymbols: false,
            },
        })

        // ****** Create a Cognito User Pool Client ******
        this.userPoolClient = new cognito.UserPoolClient(
            this,
            'CourseMonitoringAppClient',
            {
                userPool: this.userPool,
                authFlows: {
                    userPassword: true,
                    userSrp: true,
                },
                preventUserExistenceErrors: true,
            }
        )
    }
}
