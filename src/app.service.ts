import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Perf } from './interfaces/validators';
import { FetchService } from './fetch/fetch.service';
import { InfluxService } from './influx/influx';

@Injectable()
export class AppService {

  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly fetchService: FetchService,
    private readonly influxService: InfluxService,
  ) {
  }

  @Cron('0 */15 * * * *')
  async fetch() {
    this.logger.log('Fetch job triggered');
    const price = await this.fetchService.getLatestPrice();
    const performances: Array<Perf> = await this.fetchService.getPerformance();
    await this.influxService.write(price, performances);
    this.logger.log('Successfully finished fetch job');
  }

  getHealth(): string {
    return 'Alive';
  }
}
