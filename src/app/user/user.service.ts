import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../notification.service';
import { AngularFireAuth } from  "@angular/fire/auth";
import { Group } from '../group/group.service';
import { firestore } from 'firebase';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component';

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

  constructor(private afAuth: AngularFireAuth, 
    private afs: AngularFirestore,
    private notificationService: NotificationService) {
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

  joinGroup(id, dRef: MatDialogRef<CreateDialogComponent>) {
    this.afs.collection<Group>('groups').doc(id).get().toPromise().then(doc => {
      if (doc.exists) {
        let data = doc.data() as Group;
        if (data.memberIDs.includes(this.userId)) {
          this.notificationService.notification$.next({message: "You're already in this group!", action: ""});
        } else {
          this.afs.collection<Group>('groups').doc(id).update({memberIDs: firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(this.userId)))});
          dRef.close();
        }
      } else {
        this.notificationService.notification$.next({message: id, action: 'INVALID!'});
      }
    })
  }
}
