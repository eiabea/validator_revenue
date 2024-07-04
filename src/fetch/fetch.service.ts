import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Performance } from 'src/dto/performance.dto';
import * as fs from 'fs';
import { Perf, Validator } from 'src/interfaces/validators';
import { LatestStateData } from '../dto/lateststate.dto';

@Injectable()
export class FetchService {
  private readonly logger = new Logger(FetchService.name);
  private VALIDATOR_FILE_PATH: string = "/config/validators.json";
  private validatorsArray: Array<Validator> = [];

  constructor() { 
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
      this.logger.verbose(`Getting latest price from beaconcha.in`);
      const latestState = await axios.get<LatestStateData>('https://beaconcha.in/api/v1/latestState')

      const usdRoundPrice = latestState.data.rates.mainCurrencyTickerPrices.USD.roundPrice

      this.logger.verbose(`Got latest price: ${usdRoundPrice}`);

      return usdRoundPrice;

    } catch (error) {
      this.logger.error(`Unable to get latest price [${error.response.status}]`);
    }
  }

  async getPerformance(): Promise<Array<Perf>> {
    try {
      this.logger.verbose(`Getting performance data for ${this.validatorsArray.length} validators`)
      const perfArray = await Promise.all(this.validatorsArray.map(async validator => {
        return {
          validator,
          performanceData: (await axios.get<Performance>(`https://beaconcha.in/api/v1/validator/${validator.publicKey}/performance`)).data.data
        } as Perf
      }))
      this.logger.verbose(`Got performance data`)
      return perfArray;
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
