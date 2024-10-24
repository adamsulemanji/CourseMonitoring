import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CognitoConstruct extends Construct {
    public readonly userPool: cognito.UserPool;
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.userPool = new cognito.UserPool(this, 'CourseMonitoringPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            standardAttributes: {
                email: { required: true, mutable: false },
            },
        });
    }
}
