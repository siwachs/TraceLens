import { Body, Controller, Get, Post } from '@nestjs/common';

import { InvestigationService } from './investigation.service.js';

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
}
