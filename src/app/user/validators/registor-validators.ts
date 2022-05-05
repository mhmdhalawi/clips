import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export class RegistorValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error('Form controls cannot be found in the form group');
        return { passwordNotFound: true };
      }

      const error =
        control.value === matchingControl.value ? null : { mismatch: true };

      matchingControl.setErrors(error);

      return error;
    };
  }
}
