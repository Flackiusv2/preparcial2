import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { Country } from './entities/country.entity';
import { RestCountriesProvider } from './providers/rest-countries.provider';
import { COUNTRY_PROVIDER } from './interfaces/country-provider.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    HttpModule,
  ],
  providers: [
    CountriesService,
    {
      provide: COUNTRY_PROVIDER,
      useClass: RestCountriesProvider,
    },
  ],
  controllers: [CountriesController],
  exports: [CountriesService],
})
export class CountriesModule {}
