import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;
} 