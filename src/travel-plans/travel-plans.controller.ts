import { Controller, Get, Post, Body, Param, ValidationPipe } from '@nestjs/common';
import { TravelPlansService } from './travel-plans.service';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlanResponseDto } from './dto/travel-plan-response.dto';

@Controller('travel-plans')
export class TravelPlansController {
  constructor(private readonly travelPlansService: TravelPlansService) {}

  @Post()
  create(
    @Body(ValidationPipe) createTravelPlanDto: CreateTravelPlanDto,
  ): Promise<TravelPlanResponseDto> {
    return this.travelPlansService.create(createTravelPlanDto);
  }

  @Get()
  findAll(): Promise<TravelPlanResponseDto[]> {
    return this.travelPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TravelPlanResponseDto> {
    return this.travelPlansService.findOne(id);
  }
}
