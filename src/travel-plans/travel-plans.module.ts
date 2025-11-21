import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelPlansService } from './travel-plans.service';
import { TravelPlansController } from './travel-plans.controller';
import { TravelPlan } from './entities/travel-plan.entity';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TravelPlan]),
    forwardRef(() => CountriesModule),
  ],
  providers: [TravelPlansService],
  controllers: [TravelPlansController],
  exports: [TravelPlansService],
})
export class TravelPlansModule {}
