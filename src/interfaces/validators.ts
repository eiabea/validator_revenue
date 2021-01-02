import { PerformanceData } from 'src/dto/performance.dto';

export interface Validator {
  name: string;
  publicKey: string;
}

export interface Perf {
  validator: Validator;
  performanceData: PerformanceData
}