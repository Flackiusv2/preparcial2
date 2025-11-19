import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CountryResponseDto } from './dto/country-response.dto';
import { COUNTRY_PROVIDER } from './interfaces/country-provider.interface';
import type { ICountryProvider } from './interfaces/country-provider.interface';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @Inject(COUNTRY_PROVIDER)
    private readonly countryProvider: ICountryProvider,
  ) {}

  async findAll(): Promise<CountryResponseDto[]> {
    this.logger.log('Obteniendo todos los países de la base de datos');
    const countries = await this.countryRepository.find();
    
    return countries.map(country => ({
      ...country,
      source: 'cache' as const,
    }));
  }

  async findByCode(code: string): Promise<CountryResponseDto> {
    const normalizedCode = code.toUpperCase();
    this.logger.log(`Buscando país con código: ${normalizedCode}`);

    let country = await this.countryRepository.findOne({
      where: { code: normalizedCode },
    });

    if (country) {
      this.logger.log(`País ${normalizedCode} encontrado en caché`);
      return {
        ...country,
        source: 'cache',
      };
    }

    this.logger.log(`País ${normalizedCode} no encontrado en caché, consultando API externa`);
    const countryData = await this.countryProvider.getCountryByCode(normalizedCode);

    if (!countryData) {
      throw new NotFoundException(`País con código ${normalizedCode} no encontrado`);
    }

    country = this.countryRepository.create(countryData);
    await this.countryRepository.save(country);
    this.logger.log(`País ${normalizedCode} guardado en caché`);

    return {
      ...country,
      source: 'external',
    };
  }

  async ensureCountryExists(code: string): Promise<Country> {
    const normalizedCode = code.toUpperCase();
    
    let country = await this.countryRepository.findOne({
      where: { code: normalizedCode },
    });

    if (country) {
      return country;
    }

    const countryData = await this.countryProvider.getCountryByCode(normalizedCode);
    
    if (!countryData) {
      throw new NotFoundException(`País con código ${normalizedCode} no encontrado`);
    }

    country = this.countryRepository.create(countryData);
    return await this.countryRepository.save(country);
  }
}
