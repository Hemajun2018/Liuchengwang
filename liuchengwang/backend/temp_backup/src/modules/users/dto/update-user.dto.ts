import { IsString, IsEmail, IsOptional, Length, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  realName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11)
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
} 