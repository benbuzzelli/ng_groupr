import { Injectable } from '@angular/core';
import { Router } from  "@angular/router";
import { AngularFireAuth } from  "@angular/fire/auth";
import { auth } from 'firebase/app';
import { User } from  'firebase';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(public  afAuth:  AngularFireAuth, public  router:  Router,
    private notificationService: NotificationService) {
    // Adds the user to localStorage if there is one.
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('uid', JSON.stringify(this.user.uid))
      } else {
        localStorage.setItem('user', null);
        localStorage.setItem('uid', null);
      }
    });
  }

  // Returns true if the user has verified their email
  get isAuthenticated(): boolean {
    return this.user.emailVerified
  }

  // Logs a user in and either navigates to the view-contacts page,
  // or logs the user out if they are not yet authenticated.
  async login(email: string, password: string) {
    try {
      // var firebase = require("firebase/app");
      // var result = await this.afAuth.signInWithEmailAndPassword(email, password)
      console.log("Logging in")
      auth().signInWithEmailAndPassword(email, password).then((result) => {
          this.router.navigate(['home']); 
        }).catch((error) => {
          window.alert(error.message)
      })
      if (this.isAuthenticated) {
        this.router.navigate(['home']);
        this.notificationService.notification$.next({message: email, action: 'Logged in!'});
      } else {
        this.logout('Account not yet verified', '');
      }
    } catch(e) {
      this.notificationService.notification$.next({message: e.message, action: ''});
    }
  }

  // Sends email verification and navigates to the verify-email page.
  async sendEmailVerification() {
    // var firebase = require("firebase/app");
    await auth().currentUser.sendEmailVerification();
    console.log("navigating");
    this.router.navigate(['verify-email']);
  }

  // Send a verification email and then logs the user out.
  // async register(email: string, password: string) {
  //   try {
  //     // var firebase = require("firebase/app");
  //     console.log("email: " + email + "\npassword: " + password);
  //     auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
  //       // Handle Errors here.
  //       var errorCode = error.code;
  //       var errorMessage = error.message;
  //       // ...
  //     });
      
  //     // var result = await this.afAuth.createUserWithEmailAndPassword(email, password)
  //     this.sendEmailVerification();
  //     this.logout(email,'Registered!');
  //     this.notificationService.notification$.next({message: email, action: 'Registered!'});
  //   } catch(e) {
  //     this.notificationService.notification$.next({message: e.message, action: ''});
  //   }
  // }

  SendVerificationMail() {
    return auth().currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email']);
    })
  }

  async register(email, password) {
    return auth().createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SendVerificationMail(); // Sending email verification notification, when new user registers
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Routes to the login page after the password reset email has been sent.
  async sendPasswordResetEmail(passwordResetEmail: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(passwordResetEmail);
      this.notificationService.notification$.next({message: 'Password reset email sent', action: ''});
      this.router.navigate(['login']);
    } catch(e) {
      this.notificationService.notification$.next({message: e.message, action: ''});
    }
  }

  // Removes the user from the local storage as well as singing it out.
  // Then navigates to the login page.
  async logout(message: string, action: string){
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('uid');
    this.router.navigate(['login']);
    this.notificationService.notification$.next({message: message, action: action});
  }

  // Confirms if a user is logged in.
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }
}
