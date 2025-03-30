import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreatePrerequisiteDto {
  @IsString()
  content: string;
  
  @IsString()
  project_id: string;
  
  @IsDateString()
  @IsOptional()
  start_date?: string;
  
  @IsDateString()
  @IsOptional()
  expected_end_date?: string;
  
  @IsNumber()
  @IsOptional()
  duration_days?: number;
  
  @IsString()
  @IsOptional()
  status?: string;
} 