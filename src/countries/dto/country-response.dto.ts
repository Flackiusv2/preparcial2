export class CountryResponseDto {
  code: string;
  name: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  flag: string;
  source: 'cache' | 'external';
  createdAt: Date;
  updatedAt: Date;
}
