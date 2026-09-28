import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  Param,
  UploadedFile,
} from '@nestjs/common';

import { InvestigationService } from './investigation.service.js';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post(':id/assets')
  @UseInterceptors(FileInterceptor('file'))
  uploadAsset(
    @Param('id') investigationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.investigationService.uploadAsset(
      investigationId,
      file,
    );
  }
}
