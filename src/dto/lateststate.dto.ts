import { Validator } from '../interfaces/validators';

export class USD {
  roundPrice: number
}

export class MainCurrencyTickerPrices{
  USD: USD
}

export class Rates {
  mainCurrencyTickerPrices: MainCurrencyTickerPrices
}

export class LatestStateData {
  rates: Rates;
}