import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert = false;
  alertMsg = 'Please wait we are logging you in';
  alertColor = 'blue';
  inSubmission = false;

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async login() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'bg-blue-400';
    this.alertMsg = 'Please wait we are logging you in';
    const { email, password } = this.credentials;
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
    } catch (e) {
      this.alertColor = 'bg-red-400';
      this.alertMsg = 'An unexpected error occured';
      this.inSubmission = false;
      console.log(e);

      return;
    }
    this.alertColor = 'bg-green-400';
    this.alertMsg = 'You have been logged in';
  }
}
