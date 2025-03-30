import { IsString, IsEmail, IsOptional, Length, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  @Length(2, 50)
  realName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Length(11, 11)
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;
} 