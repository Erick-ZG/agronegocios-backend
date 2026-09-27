import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export function isValidDocument(type: DocumentType, number: string) {
  const value = number.trim();
  if (type === DocumentType.DNI) {
    return /^\d{8}$/.test(value);
  }
  if (type === DocumentType.RUC) {
    return /^\d{11}$/.test(value);
  }
  return /^[A-Za-z0-9]{8,12}$/.test(value);
}

@ValidatorConstraint({ name: 'documentMatchesType', async: false })
export class DocumentMatchesTypeConstraint implements ValidatorConstraintInterface {
  validate(documentNumber: string, args: ValidationArguments) {
    const object = args.object as { documentType?: DocumentType };
    if (!object.documentType || !documentNumber) {
      return false;
    }
    return isValidDocument(object.documentType, documentNumber);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as { documentType?: DocumentType };
    if (object.documentType === DocumentType.DNI) {
      return 'El DNI debe tener 8 dígitos';
    }
    if (object.documentType === DocumentType.RUC) {
      return 'El RUC debe tener 11 dígitos';
    }
    return 'El carné de extranjería debe tener entre 8 y 12 caracteres';
  }
}
