import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';

import { RegistorValidators } from '../validators/registor-validators';

import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );

  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);

  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  phoneNumber = new FormControl('', [Validators.required]);

  inSubmission = false;

  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      age: this.age,
      phoneNumber: this.phoneNumber,
    },
    [RegistorValidators.match('password', 'confirmPassword')]
  );

  showAlert = false;
  alertMessage = 'Your account is being created. Please wait...';
  alertColor = 'bg-blue-400';

  constructor(
    private authService: AuthService,
    private emailTaken: EmailTaken
  ) {}

  async register() {
    this.showAlert = true;
    this.alertMessage = 'Your account is being created. Please wait...';
    this.alertColor = 'bg-blue-400';

    this.inSubmission = true;

    const { email, password, name, phoneNumber, age } = this.registerForm.value;

    try {
      await this.authService.createUser({
        email,
        password,
        name,
        phoneNumber,
        age,
      });
    } catch (error) {
      console.log(error);
      this.alertMessage = "Sorry, we couldn't create your account.";
      this.alertColor = 'bg-red-400';

      this.inSubmission = false;
      return;
    }

    this.alertMessage = 'Your account has been created.';
    this.alertColor = 'bg-green-400';
  }
}
