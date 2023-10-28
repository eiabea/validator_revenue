import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) {
  }

  @Get('/health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
