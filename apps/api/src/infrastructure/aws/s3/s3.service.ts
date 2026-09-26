import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { AwsConfig } from '../aws.config.js';
import { createS3Client } from './s3.client.js';
import type { S3Bucket } from './s3.types.js';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly buckets: Record<S3Bucket, string>;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.getOrThrow<AwsConfig>('aws');

    this.client = createS3Client(config);

    this.buckets = {
      investigationImages:
        config.s3?.buckets.investigationImages ??
        (() => {
          throw new Error(
            'AWS_S3_INVESTIGATION_IMAGES_BUCKET is not configured',
          );
        })(),
    };
  }

  private getBucket(bucket: S3Bucket): string {
    return this.buckets[bucket];
  }

  async put(
    bucket: S3Bucket,
    key: string,
    body: Uint8Array | Buffer | string,
    contentType?: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.getBucket(bucket),
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async get(bucket: S3Bucket, key: string) {
    return this.client.send(
      new GetObjectCommand({
        Bucket: this.getBucket(bucket),
        Key: key,
      }),
    );
  }

  async delete(bucket: S3Bucket, key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.getBucket(bucket),
        Key: key,
      }),
    );
  }
}
