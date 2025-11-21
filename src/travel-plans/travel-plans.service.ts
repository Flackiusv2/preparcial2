import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlan } from './entities/travel-plan.entity';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlanResponseDto } from './dto/travel-plan-response.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class TravelPlansService {
  private readonly logger = new Logger(TravelPlansService.name);

  constructor(
    @InjectRepository(TravelPlan)
    private readonly travelPlanRepository: Repository<TravelPlan>,
    private readonly countriesService: CountriesService,
  ) {}

  async create(createTravelPlanDto: CreateTravelPlanDto): Promise<TravelPlanResponseDto> {
    const { countryCode, startDate, endDate, title, notes } = createTravelPlanDto;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    this.logger.log(`Verificando existencia del país: ${countryCode}`);
    await this.countriesService.ensureCountryExists(countryCode.toUpperCase());

    const travelPlan = this.travelPlanRepository.create({
      countryCode: countryCode.toUpperCase(),
      title,
      startDate: start,
      endDate: end,
      notes,
    });

    const savedPlan = await this.travelPlanRepository.save(travelPlan);
    this.logger.log(`Plan de viaje creado con ID: ${savedPlan.id}`);

    return await this.findOne(savedPlan.id);
  }

  async findAll(): Promise<TravelPlanResponseDto[]> {
    this.logger.log('Obteniendo todos los planes de viaje');
    const plans = await this.travelPlanRepository.find({
      relations: ['country'],
    });

    return plans.map(plan => this.mapToResponseDto(plan));
  }

  async findOne(id: string): Promise<TravelPlanResponseDto> {
    this.logger.log(`Buscando plan de viaje con ID: ${id}`);
    const plan = await this.travelPlanRepository.findOne({
      where: { id },
      relations: ['country'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan de viaje con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(plan);
  }

  async hasPlansForCountry(countryCode: string): Promise<boolean> {
    const normalizedCode = countryCode.toUpperCase();
    const count = await this.travelPlanRepository.count({
      where: { countryCode: normalizedCode },
    });
    return count > 0;
  }

  private mapToResponseDto(plan: TravelPlan): TravelPlanResponseDto {
    return {
      id: plan.id,
      countryCode: plan.countryCode,
      country: {
        ...plan.country,
        source: 'cache',
      },
      title: plan.title,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes,
      createdAt: plan.createdAt,
    };
  }
}
