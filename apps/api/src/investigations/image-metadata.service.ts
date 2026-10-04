import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageMetadataService {
  async extract(buffer: Buffer) {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      throw new Error('Unable to determine image format');
    }

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: buffer.length,
      hasAlpha: metadata.hasAlpha ?? false,

      exif: metadata.exif ? metadata.exif.toString('base64') : null,
      orientation: metadata.orientation ?? null,
      density: metadata.density ?? null,
    };
  }
}
