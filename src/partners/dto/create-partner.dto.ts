import { DocumentType, PartnerKind, PersonType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DocumentMatchesTypeConstraint } from '../document.validator';

export class PartnerContactDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreatePartnerDto {
  @IsEnum(PartnerKind)
  kind: PartnerKind;

  @IsEnum(PersonType)
  personType: PersonType;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @Validate(DocumentMatchesTypeConstraint)
  documentNumber: string;

  @ValidateIf((dto: CreatePartnerDto) => dto.personType === PersonType.JURIDICA)
  @IsString()
  @MinLength(3)
  businessName?: string;

  @ValidateIf((dto: CreatePartnerDto) => dto.personType === PersonType.NATURAL)
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ValidateIf((dto: CreatePartnerDto) => dto.personType === PersonType.NATURAL)
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  tradeName?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerContactDto)
  contacts?: PartnerContactDto[];
}
