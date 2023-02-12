import { Validator } from '../interfaces/validators';
export class PerformanceData {
  balance: number;
  performance1d: number;
  performance7d: number;
  performance31d: number;
  performance365d: number;
  validatorindex: number;
}

export class Performance {
  status: string;
  data: [PerformanceData];
}