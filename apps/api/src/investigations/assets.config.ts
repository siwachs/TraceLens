import { registerAs } from '@nestjs/config';

export interface AssetsConfig {
  investigationImage: {
    allowedFormats: string[];
    maxPixels: number;
  };
  processingStaleAfterMS: number;
}

export const INVESTIGATION_IMAGE_MAX_UPLOAD_BYTES = Number(
  process.env.INVESTIGATION_IMAGE_MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024,
);

export default registerAs('assets', (): AssetsConfig => ({
  investigationImage: {
    allowedFormats: (
      process.env.INVESTIGATION_IMAGE_ALLOWED_FORMATS ?? 'jpeg,jpg,png,webp'
    )
      .split(',')
      .map((format) => format.trim().toLowerCase())
      .filter(Boolean),

    maxPixels: Number(
      process.env.INVESTIGATION_IMAGE_MAX_PIXELS ?? 100_000_000,
    ),
  },

  processingStaleAfterMS: Number(
    process.env.PROCESSING_STALE_AFTER_MS ?? 5 * 60 * 1000,
  ),
}));
