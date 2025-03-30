import { IsString, IsOptional, IsArray, IsEnum, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { NodeStatus } from '../../../database/entities/node.entity';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  descriptions?: string[];

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsEnum(NodeStatus)
  @IsOptional()
  status?: NodeStatus;

  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @IsDateString()
  @IsOptional()
  expectedEndDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPrerequisite?: boolean;

  @IsBoolean()
  @IsOptional()
  isResult?: boolean;
} 