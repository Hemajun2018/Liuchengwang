import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { DeliverableStatus } from '../../../database/entities/deliverable.entity';

export class CreateDeliverableDto {
  @IsString()
  description: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  expected_end_date?: string;

  @IsOptional()
  duration_days?: number;

  @IsEnum(DeliverableStatus)
  @IsOptional()
  status?: DeliverableStatus;
} 