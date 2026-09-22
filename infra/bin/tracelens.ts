import * as cdk from "aws-cdk-lib";
import { TraceLensStack } from "../lib/tracelens-stack.js";

const app = new cdk.App();

new TraceLensStack(app, "TraceLensStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? "000000000000",
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
});
