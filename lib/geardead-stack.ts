import * as cdk from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  Distribution,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

const proj = "GearDead";
const certArn =
  "arn:aws:acm:us-east-1:456500572160:certificate/d3ef1284-f9b2-48a6-8f46-9e9707decdb6";

export class GeardeadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, "WebsiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("./src/.next/out")],
      destinationBucket: websiteBucket,
    });

    new Distribution(this, `${proj}Distribution`, {
      defaultBehavior: {
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        origin: new S3Origin(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
          ttl: cdk.Duration.minutes(30),
        },
        {
          httpStatus: 500,
          responseHttpStatus: 500,
          responsePagePath: "/500.html",
          ttl: cdk.Duration.minutes(30),
        },
      ],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      certificate: certArn
        ? Certificate.fromCertificateArn(this, "SSLCertificate", certArn)
        : undefined,
      domainNames: certArn ? ["geardead.com"] : undefined,
    });
  }
}
