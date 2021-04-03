import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, FieldType, IPoint } from 'influx';
import { Perf } from 'src/interfaces/validators';

@Injectable()
export class InfluxService implements OnModuleInit {
  private readonly logger = new Logger(InfluxService.name);

  private INFLUX_HOST: string = this.configService.get<string>('INFLUX_HOST', 'localhost');
  private INFLUX_PORT: string = this.configService.get<string>('INFLUX_PORT', '8086');
  private INFLUX_DB: string = this.configService.get<string>('INFLUX_DB', 'etherstaker');
  private INFLUX_MEASUREMENT: string = this.configService.get<string>('INFLUX_MEASUREMENT', 'performance');
  private INFLUX_STAKERS_MEASUREMENT: string = this.configService.get<string>('INFLUX_STAKERS_MEASUREMENT', 'stakers');

  private client: InfluxDB;

  constructor(
    private readonly configService: ConfigService,
  ) {
  }

  async onModuleInit() {
    this.client = new InfluxDB({
      host: this.INFLUX_HOST,
      port: parseInt(this.INFLUX_PORT, 10),
      database: this.INFLUX_DB,
      schema: [
        {
          measurement: this.INFLUX_MEASUREMENT,
          fields: {
            price: FieldType.FLOAT,
            perf1d: FieldType.INTEGER,
            perf7d: FieldType.INTEGER,
            perf31d: FieldType.INTEGER,
            perf365d: FieldType.INTEGER,
            balance: FieldType.INTEGER,
          },
          tags: [
            'validator', 
          ],
        },
        {
          measurement: this.INFLUX_STAKERS_MEASUREMENT,
          fields: {
            eth: FieldType.FLOAT,
            dollar: FieldType.FLOAT,
          },
          tags: [
            'staker',
            'validator'
          ],
        },
      ],
    });
    const databases = await this.client.getDatabaseNames();
    if (!databases.includes(this.INFLUX_DB)) {
      this.logger.log('Created influx database');
      await this.client.createDatabase(this.INFLUX_DB);
    }
    this.logger.log('Initialized influx');
  }

  async write(price: number, performances: Array<Perf>): Promise<void> {
    await Promise.all([
      this.writePerformance(price, performances),
      this.writeStakers(price, performances)
    ]);
  }

  async writePerformance(price: number, performances: Array<Perf>): Promise<void> {

    const pointsToWrite = performances.map(perf => {
      return {
        tags: {
          validator: perf.validator.name,
        },
        fields: {
          price,
          perf1d: perf.performanceData?.performance1d,
          perf7d: perf.performanceData?.performance7d,
          perf31d: perf.performanceData?.performance31d,
          perf365d: perf.performanceData?.performance365d,
          balance: perf.performanceData?.balance,
        },
      };
    });

    await this.client.writeMeasurement(this.INFLUX_MEASUREMENT, pointsToWrite);
  }

  async writeStakers(price: number, performances: Array<Perf>): Promise<void> {

    // The beaconcha.in API returns the values in Gwei
    const ETH_PER_VALIDATOR = 32 * 1e9;

    const pointsToWrite = performances.map(perf => {
      return perf.validator.stakers.map(staker => {

        const ethShare = ((perf.performanceData.balance - ETH_PER_VALIDATOR) / ETH_PER_VALIDATOR) * staker.share;

        return {
          tags: {
            staker: staker.name,
            validator: perf.validator.name,
          },
          fields: {
            eth: ethShare,
            dollar: ethShare * price,
          },
        };
      })
    // map in map produces a [[],[],...] structure, so we have to flatten it here
    }).reduce((acc, val) => acc.concat(val), []);

    await this.client.writeMeasurement(this.INFLUX_STAKERS_MEASUREMENT, pointsToWrite);
  }
}
