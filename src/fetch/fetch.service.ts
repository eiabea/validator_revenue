import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Performance } from 'src/dto/performance.dto';
import * as fs from 'fs';
import { Perf, Validator } from 'src/interfaces/validators';

@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);
  private VALIDATOR_FILE_PATH: string = "/config/validators.json";
  private validatorsArray: Array<Validator> = [];

  constructor(
    private readonly configService: ConfigService,
  ) { 
    try{
      this.logger.debug(`Loading and parsing validators config from ${this.VALIDATOR_FILE_PATH}`)
      this.validatorsArray = JSON.parse(fs.readFileSync(this.VALIDATOR_FILE_PATH).toString());
    }catch(error){
      this.logger.error("Unable to read validators file", error);
      throw Error("No validator provided");
    }
  }

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

  async getPerformance(): Promise<Array<Perf>> {
    try {
      this.logger.debug(`Loading performance data for ${this.validatorsArray.length} validators`)
      return await Promise.all(this.validatorsArray.map(async validator => {
        return {
          validator,
          performanceData: (await axios.get<Performance>(`https://beaconcha.in/api/v1/validator/${validator.publicKey}/performance`)).data.data
        } as Perf
      }))
    } catch (error) {
      const { response } = error;
      if(response){
        this.logger.error(`Unable to get latest performance data [${response.status}]`);
      }else{
        this.logger.debug(error);
        this.logger.error(`Unable to get latest performance data [Network Error]`);
      }
    }

  }
}