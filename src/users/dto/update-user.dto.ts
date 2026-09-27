import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}
