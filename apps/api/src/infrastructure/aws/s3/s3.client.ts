import { S3Client } from '@aws-sdk/client-s3';

import { AwsConfig } from '../aws.config.js';
import { createAwsClientConfig } from '../aws.client.js';

export function createS3Client(config: AwsConfig): S3Client {
  return new S3Client({
    ...createAwsClientConfig(config),

    forcePathStyle: Boolean(config.endpoint),
  });
}
