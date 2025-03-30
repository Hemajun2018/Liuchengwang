import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { NodeStatus } from '../../../database/entities/node.entity';

export class CreateNodeDto {
  @IsString()
  name: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  @IsOptional()
  isPrerequisite?: boolean;

  @IsBoolean()
  @IsOptional()
  isResult?: boolean;
} 