import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);

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

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    password: this.password,
    confirmPassword: this.confirmPassword,
    age: this.age,
    phoneNumber: this.phoneNumber,
  });

  showAlert = false;
  alertMessage = 'Your account is being created. Please wait...';
  alertColor = 'blue';

  constructor() {}

  register() {
    this.showAlert = true;
    this.alertMessage = 'Your account is being created. Please wait...';
    this.alertColor = 'blue';
  }
}
