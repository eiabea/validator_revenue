import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FetchService } from './fetch/fetch.service';
import { InfluxService } from './influx/influx';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot()
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    FetchService,
    InfluxService
  ],
})
export class AppModule { }
