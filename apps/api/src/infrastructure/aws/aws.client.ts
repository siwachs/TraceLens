import { AwsConfig } from './aws.config.js';

export function createAwsClientConfig(config: AwsConfig) {
  return {
    region: config.region,
    endpoint: config.endpoint,
    credentials: config.credentials,
  };
}
