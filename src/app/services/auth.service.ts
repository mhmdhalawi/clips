import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { delay, map, Observable, filter, switchMap, of } from 'rxjs';

import { IUser } from '../models/user.models';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<IUser> =
    this.db.collection<IUser>('users');

  public isAuthenticated$: Observable<boolean>;

  public isAuthenticatedWithDelay$: Observable<boolean>;

  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(500));

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });
  }

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

  public async logout(event?: MouseEvent) {
    event?.preventDefault();
    await this.auth.signOut();

    if (this.redirect) {
      this.router.navigate(['/']);
    }
  }
}
