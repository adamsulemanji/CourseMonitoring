import { CfnOutput, Duration, RemovalPolicy, Size } from 'aws-cdk-lib';
import {
  AllowedMethods,
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class FrontendConstruct extends Construct {
  constructor(app: Construct, id: string) {
    super(app, id);

    // ********** Frontend Bucket **********
    const myBucket = new Bucket(this, 'myBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-OAI');

    // ********** Bucket Policy **********
    myBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [myBucket.arnForObjects('*')],
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
      }),
    );

    // ********** CloudFront Distribution **********
    const s3Origin = new S3Origin(myBucket);

    const distribution = new Distribution(this, 'myDist', {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200, // Serve index.html
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200, // Serve index.html
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
      ],
    });

    // ********** Bucket Deployment **********
    new BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [Source.asset('./frontend/my-react-app/build')],
      destinationBucket: myBucket,
      distribution,
      memoryLimit: 1024,
      ephemeralStorageSize: Size.mebibytes(1024),
      distributionPaths: ['/*'],
    });

    // ********** Output **********
    new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
      description: 'Distribution Domain Name',
      exportName: 'DistributionDomainName',
    });
  }
}
