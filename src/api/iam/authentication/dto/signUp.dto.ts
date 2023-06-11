import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}
