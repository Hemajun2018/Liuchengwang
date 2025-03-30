import { IsString, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { MaterialType, MaterialStatus } from '../../../database/entities/material.entity';

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @IsOptional()
  @IsString()
  fileSize?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  expected_end_date?: string;

  @IsOptional()
  @IsInt()
  duration_days?: number;

  @IsOptional()
  @IsEnum(MaterialStatus)
  status?: MaterialStatus;
} 