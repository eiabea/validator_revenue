import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Performance, PerformanceData } from 'src/dto/performance.dto';

@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);
  private VALIDATOR: string = this.configService.get<string>('VALIDATOR');

  constructor(
    private readonly configService: ConfigService,
  ) { }

  async getLatestPrice(): Promise<number | undefined> {
    try {
      const latestState = await axios.get('https://beaconcha.in/latestState')

      const { ethPrice } = latestState.data

      this.logger.debug(`Got latest price: ${ethPrice}`);

      return ethPrice;

    } catch (error) {
      this.logger.error(`Unable to get latest price [${error.response.status}]`);
    }
  }

  async getPerformance(): Promise<PerformanceData> {

    if (!this.VALIDATOR) {
      throw Error("No validator provided");
    }

    try {
      const performance: AxiosResponse<Performance> = await axios.get<Performance>(`https://beaconcha.in/api/v1/validator/${this.VALIDATOR}/performance`)

      this.logger.debug(`Got latest performance data`);

      return performance.data.data;
    } catch (error) {
      this.logger.error(`Unable to get latest performance data [${error.response.status}]`);
    }

  }
}