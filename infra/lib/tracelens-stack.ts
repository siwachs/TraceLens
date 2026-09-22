import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

// Resources
import * as s3 from "aws-cdk-lib/aws-s3";

export class TraceLensStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 buckets
    const investigationBucket = new s3.Bucket(this, "InvestigationImages", {
      bucketName: "tracelens-investigation-images",
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new cdk.CfnOutput(this, "InvestigationBucketName", {
      value: investigationBucket.bucketName,
    });
  }
}
