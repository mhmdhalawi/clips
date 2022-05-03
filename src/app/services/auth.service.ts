import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

import { IUser } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<IUser> =
    this.db.collection<IUser>('users');

  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {}

  public async createUser(userData: IUser) {
    const { email, password, phoneNumber, age, name } = userData;
    if (!password) throw new Error('Password is required');
    const userCred = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    if (!userCred.user) throw new Error('User not found');

    await this.userCollection.doc(userCred.user.uid).set({
      name,
      phoneNumber,
      age,
      email,
    });

    await userCred.user.updateProfile({
      displayName: name,
    });
  }
}
