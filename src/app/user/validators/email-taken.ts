import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}
  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    return new Promise((resolve) => {
      this.auth
        .fetchSignInMethodsForEmail(control.value)
        .then((signInMethods) => {
          resolve(signInMethods.length > 0 ? { emailTaken: true } : null);
        });
    });
  };
}
