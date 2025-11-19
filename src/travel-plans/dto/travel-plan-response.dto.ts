import { CountryResponseDto } from '../../countries/dto/country-response.dto';

export class TravelPlanResponseDto {
  id: string;
  countryCode: string;
  country: CountryResponseDto;
  title: string;
  startDate: Date;
  endDate: Date;
  notes: string;
  createdAt: Date;
}
