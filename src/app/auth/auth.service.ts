import { Injectable } from '@angular/core';
import { Router } from  "@angular/router";
import { AngularFireAuth } from  "@angular/fire/auth";
import { auth } from 'firebase/app';
import { User } from  'firebase';
import { NotificationService } from '../notification.service';
import { UserService } from '../user/user.service';
import { Group, GroupService } from '../group/group.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User;

  constructor(public  afAuth:  AngularFireAuth, 
    public  router:  Router,
    private notificationService: NotificationService, 
    private groupService: GroupService,
    private userService: UserService) {
    // Adds the user to localStorage if there is one.
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.user = user;
        // localStorage.setItem('user', JSON.stringify(this.user));
        // localStorage.setItem('uid', JSON.stringify(this.user.uid))
      } else {
        // localStorage.setItem('user', null);
        // localStorage.setItem('uid', null);
      }
    });
  }

  // Logs a user in and either navigates to the view-contacts page,
  // or logs the user out if they are not yet authenticated.
  async login(email: string, password: string) {
    auth().signInWithEmailAndPassword(email, password).then((result) => {
        if (this.user.emailVerified) {
          this.router.navigate(['home']);
        } else {
          this.notificationService.notification$.next({message: email, action: 'Not yet verified!'});
        }
      }).catch((error) => {
        window.alert(error.message)
    })
  }

  // Removes the user from the local storage as well as singing it out.
  // Then navigates to the login page.
  async logout(message: string, action: string) {
    await this.afAuth.signOut();
    // localStorage.removeItem('user');
    // localStorage.removeItem('uid');
    this.router.navigate(['login']);
    this.notificationService.notification$.next({message: message, action: action});
  }

  async logoutNoMessage() {
    await this.afAuth.signOut();
    // localStorage.removeItem('user');
    // localStorage.removeItem('uid');
  }

  sendEmailVerification(email, password, first, last, nickname) {
    return auth().currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email']);
      this.userService.createUser(first, last, nickname, email);
    })
  }

  async register(email, password, first, last, nickname) {
    return auth().createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.sendEmailVerification(email, password, first, last, nickname); // Sending email verification notification, when new user registers
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

  // Confirms if a user is logged in.
  get isVerified(): boolean {
    if (this.user)
      return this.user.emailVerified;
    return false;
  }
}
