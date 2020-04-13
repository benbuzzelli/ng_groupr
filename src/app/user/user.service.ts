import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from '../notification.service';
import { AngularFireAuth } from  "@angular/fire/auth";
import { map } from "rxjs/operators";
import { take } from 'rxjs/operators';

export class User {
  id: string;
  displayName: string;
  fullName: string;
  first: string;
  last: string;
  nickname: string;
  email: string;
  // groupIDs: string[];

  constructor(id: string, first: string, last: string, nickname: string, email: string) {
    this.id = id;
    this.first = first;
    this.last = last;
    this.nickname = nickname != '' ? nickname : '';
    this.fullName = this.first + " " + this.last;
    this.displayName = this.nickname == '' ? this.fullName : this.nickname;
    this.email = email;
    // this.groupIDs = [];
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User;
  userId: string;
  userRef: AngularFirestoreCollection<User> = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.authState.subscribe(user => {
      if(user) this.userId = user.uid
    })
  }

  resolveAfter2Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.userId);
      }, 2000);
    });
  }

  setUser(userId) {
    this.userRef = this.afs.collection<User>('users', ref => ref.where("id", "==", userId));
    this.userRef.get().toPromise().then((res) => {
      res.forEach(group => {
        this.user = group.data() as User;
      });
    })
  }

  async createUser(first: string, last: string, nickname: string, email: string) {
    let user = new User(this.userId, first, last, nickname, email)
    this.userRef = this.afs.collection<User>('users');
    this.userRef.add(JSON.parse(JSON.stringify(user)));
  }

  // updateGroupIDs(value: string) {
  //   let doc = this.afs.collection<User>(`user-${this.userId}`);

  //   doc.get().toPromise().then((res) => {
  //     res.forEach(user => {
  //       let data = user.data();
  //       let id = user.id;
  //       let groupIDs = data.groupIDs === undefined ? [value] : data.groupIDs;
  //       groupIDs.push(value);
  //       this.afs.collection<User>(`user-${this.userId}`).doc(id).update({groupIDs: groupIDs});
  //     })
  //   })
  // }
}
