import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpsertRoleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
