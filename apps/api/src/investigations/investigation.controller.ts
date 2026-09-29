import {
  Controller,
  Body,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { InvestigationService } from './investigation.service.js';

import type { Response } from 'express';
import type { Readable } from 'node:stream';

@Controller('investigations')
export class InvestigationController {
  constructor(private readonly investigationService: InvestigationService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.investigationService.create(name);
  }

  @Get()
  findAll() {
    return this.investigationService.findAll();
  }

  @Post(':investigationId/assets')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @Param('investigationId') investigationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.investigationService.uploadAsset(investigationId, file);
  }

  @Get(':investigationId/assets/:assetId')
  async getAsset(
    @Param('investigationId') investigationId: string,
    @Param('assetId') assetId: string,
    @Res() response: Response,
  ) {
    const { asset, object } = await this.investigationService.getAsset(
      investigationId,
      assetId,
    );

    response.setHeader('Content-Type', asset.contentType);

    response.setHeader('Content-Length', asset.sizeBytes.toString());

    if (object.Body) {
      (object.Body as Readable).pipe(response);
    }
  }
}
