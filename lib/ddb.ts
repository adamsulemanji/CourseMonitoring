import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export class DynamoDBConstruct extends Construct {
    public readonly userTable: dynamodb.Table
    public readonly classTable: dynamodb.Table

    constructor(scope: Construct, id: string) {
        super(scope, id)

        // ****** Create a DynamoDB Table ******
        this.userTable = new dynamodb.Table(this, 'UserTable', {
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })

        // ****** Create a DynamoDB Table ******
        this.classTable = new dynamodb.Table(this, 'ClassTable', {
            partitionKey: {
                name: 'classId',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
    }
}
