import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { FetchService } from './fetch/fetch.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InfluxService } from './influx/influx';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { Perf } from './interfaces/validators';

@Controller()
export class AppController implements OnModuleInit {

  private readonly logger = new Logger(AppController.name);

  private CRON_PATTERN: string = this.configService.get<string>('CRON_PATTERN', '0 0 * * * *');

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly fetchService: FetchService,
    private readonly influxService: InfluxService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
  }
  async onModuleInit() {
    this.logger.log(`Adding new cronjob with the pattern: ${this.CRON_PATTERN}`);
    const fetchJob: CronJob = new CronJob(this.CRON_PATTERN, async () => {
      this.logger.debug('Triggered fetch job');
      const price = await this.fetchService.getLatestPrice();
      const performances: Array<Perf> = await this.fetchService.getPerformance();
      this.influxService.write(price, performances);
    });
    this.schedulerRegistry.addCronJob('fetch-job', fetchJob);
    fetchJob.start();
  }

  @Get('/health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
