import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ICountryProvider, CountryData } from '../interfaces/country-provider.interface';

@Injectable()
export class RestCountriesProvider implements ICountryProvider {
  private readonly logger = new Logger(RestCountriesProvider.name);
  private readonly baseUrl = 'https://restcountries.com/v3.1';

  constructor(private readonly httpService: HttpService) {}

  async getCountryByCode(code: string): Promise<CountryData | null> {
    try {
      this.logger.log(`Consultando país ${code} desde RestCountries API`);
      
      const fields = 'cca3,name,region,subregion,capital,population,flags';
      const url = `${this.baseUrl}/alpha/${code}?fields=${fields}`;

      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      const data = response.data;

      return {
        code: data.cca3,
        name: data.name?.common || data.name?.official || 'Unknown',
        region: data.region || '',
        subregion: data.subregion || '',
        capital: data.capital?.[0] || '',
        population: data.population || 0,
        flag: data.flags?.png || data.flags?.svg || '',
      };
    } catch (error) {
      this.logger.error(`Error al consultar país ${code}: ${error.message}`);
      return null;
    }
  }
}
