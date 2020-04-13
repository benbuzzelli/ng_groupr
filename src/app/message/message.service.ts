import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import {formatDate} from '@angular/common';
import { UserService, User } from '../user/user.service';
import { Group } from '../group/group.service';
import { firestore } from 'firebase';

export class Message {
  user: User;
  value: string;
  timestamp: string;

  constructor(user, value, timestamp) {
    this.user = user;
    this.value = value;
    this.timestamp = timestamp;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private userService: UserService,private afs: AngularFirestore) { }

  getMessage(user, value) {
    let date = Date.now();
    console.log(date)
    return new Message(user, value, date);
  }

  addMessage(value, id) {
    if (value === '')
      return;
    let user = this.userService.user;
    let message = this.getMessage(user, value);
    this.afs.collection<Group>('groups').doc(id).update({messages: firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(message)))});
  }
}
