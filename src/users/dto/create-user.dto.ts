import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
