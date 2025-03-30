import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isPrerequisite?: boolean;

  @IsBoolean()
  @IsOptional()
  isResult?: boolean;
} 