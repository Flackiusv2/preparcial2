export interface CountryData {
  code: string;
  name: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  flag: string;
}

export interface ICountryProvider {
  getCountryByCode(code: string): Promise<CountryData | null>;
}

export const COUNTRY_PROVIDER = 'COUNTRY_PROVIDER';
