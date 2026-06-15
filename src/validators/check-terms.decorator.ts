import {
  registerDecorator,
  // ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsTermsAccepted' })
class IsTermsAcceptedConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return value === true;
  }

  defaultMessage(/*args: ValidationArguments*/): string {
    return 'You must accept the terms and conditions';
  }
}

export function IsTermsAccepted(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsTermsAccepted',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsTermsAcceptedConstraint,
    });
  };
}
