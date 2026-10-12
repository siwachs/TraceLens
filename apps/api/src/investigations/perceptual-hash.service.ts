import { Injectable } from '@nestjs/common';

import phash from 'sharp-phash';

@Injectable()
export class PerceptualHashService {
  async calculate(buffer: Buffer): Promise<string> {
    return phash(buffer);
  }
}
