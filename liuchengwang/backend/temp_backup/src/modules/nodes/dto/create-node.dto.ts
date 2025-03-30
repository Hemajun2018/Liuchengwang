import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { NodeStatus } from '../../../database/entities/node.entity';

export class CreateNodeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  descriptions?: string[];

  @IsNumber()
  order: number;

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