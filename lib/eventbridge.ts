import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class EventConstruct extends Construct {
    public eventRule: events.Rule;

    constructor(scope: Construct, id: string, lambdaFunction: lambda.Function) {
        super(scope, id);

        // ********** Event bridge Creation **********
        this.eventRule = new events.Rule(this, 'CourseMonitoring3Minutes', {
            schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
            enabled: false,
        });

        // ********** Add target to Event Bridge Rule **********
        this.eventRule.addTarget(new targets.LambdaFunction(lambdaFunction));
    }
}
