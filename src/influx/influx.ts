import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, FieldType } from 'influx';
import { Perf } from 'src/interfaces/validators';

@Injectable()
export class InfluxService implements OnModuleInit {
  private readonly logger = new Logger(InfluxService.name);

  private INFLUX_HOST: string = this.configService.get<string>('INFLUX_HOST', 'localhost');
  private INFLUX_PORT: string = this.configService.get<string>('INFLUX_PORT', '8086');
  private INFLUX_USERNAME: string | undefined = this.configService.get<string>('INFLUX_USERNAME', undefined);
  private INFLUX_PASSWORD: string | undefined = this.configService.get<string>('INFLUX_PASSWORD', undefined);
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
      username: this.INFLUX_USERNAME,
      password: this.INFLUX_PASSWORD,
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
            price: FieldType.FLOAT,
            revenue: FieldType.FLOAT,
            revenue_with_deposit: FieldType.FLOAT,
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
    this.logger.verbose("Writing data");
    await Promise.all([
      this.writePerformance(price, performances),
      this.writeStakers(price, performances)
    ]);
    this.logger.verbose("Successfully wrote data");
  }

  async writePerformance(price: number, performances: Array<Perf>): Promise<void> {
    this.logger.verbose("Writing performance data");
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
    this.logger.verbose("Successfully wrote performance data")
  }

  async writeStakers(price: number, performances: Array<Perf>): Promise<void> {
    this.logger.verbose("Writing stakers data");

    const pointsToWrite = performances.map(perf => {

      // Backwards compatibility, if no stakers are available use a default name with 32 shares
      if(!perf.validator.stakers || perf.validator.stakers.length == 0){
        perf.validator.stakers  = [
          {
            name: "staker",
            share: 32
          }
        ]
      }

      const ethPerValidator = perf.validator.stakers.reduce((prev, curr) => {
        return prev + curr.share;
      // The beaconcha.in API returns the values in Gwei
      }, 0) * 1e9;

      return perf.validator.stakers.map(staker => {

        const revenue = ((perf.performanceData.balance - ethPerValidator) / ethPerValidator) * staker.share;

        return {
          tags: {
            staker: staker.name,
            validator: perf.validator.name,
          },
          fields: {
            price,
            revenue,
            revenue_with_deposit: revenue + staker.share,
          },
        };
      })
    // map in map produces a [[],[],...] structure, so we have to flatten it here
    }).reduce((acc, val) => acc.concat(val), []);

    await this.client.writeMeasurement(this.INFLUX_STAKERS_MEASUREMENT, pointsToWrite);
    this.logger.verbose("Successfully wrote stakers data");
  }
}
