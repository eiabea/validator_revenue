import { PerformanceData } from 'src/dto/performance.dto';

interface Staker {
  name: string;
  share: number;
}

export interface Validator {
  name: string;
  publicKey: string;
  stakers: Staker[];
}

export interface Perf {
  validator: Validator;
  performanceData: [PerformanceData]
}