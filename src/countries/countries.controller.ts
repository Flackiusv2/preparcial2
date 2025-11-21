import { Controller, Get, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryResponseDto } from './dto/country-response.dto';
import { AuthGuard } from './guards/auth.guard';
import { TravelPlansService } from '../travel-plans/travel-plans.service';

@Controller('countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
    private readonly travelPlansService: TravelPlansService,
  ) {}

  @Get()
  findAll(): Promise<CountryResponseDto[]> {
    return this.countriesService.findAll();
  }

  @Get(':code')
  findByCode(@Param('code') code: string): Promise<CountryResponseDto> {
    return this.countriesService.findByCode(code);
  }

  @Delete(':alpha3Code')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCountry(@Param('alpha3Code') alpha3Code: string): Promise<void> {
    return this.countriesService.deleteCountry(alpha3Code, this.travelPlansService);
  }
}
