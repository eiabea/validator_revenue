import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { FetchService } from './fetch/fetch.service';
import { Cron } from '@nestjs/schedule';
import { InfluxService } from './influx/influx';

@Controller()
export class AppController implements OnModuleInit {

  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly fetchService: FetchService,
    private readonly influxService: InfluxService,
  ) {
  }
  async onModuleInit() {
    const price = await this.fetchService.getLatestPrice();
    const perf = await this.fetchService.getPerformance();
    this.influxService.write(price, perf);
  }

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }

  @Get('/health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
