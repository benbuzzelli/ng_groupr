import { Injectable } from '@angular/core';
import { AngularFireAuth } from  "@angular/fire/auth";
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { Observable, of } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { element } from 'protractor';
import { NotificationService } from '../notification.service';
import { UUID } from 'angular2-uuid';
import { UserService, User } from '../user/user.service';
import { Message } from '../message/message.service';

export class Group {
  owner: string;
  id: string;
  name: string;
  description: string;
  members: User[];
  memberIDs: string[];
  messages: Message[];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.messages = [];
    this.memberIDs = [];
    this.members = [];
  }
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  
  baseDBUrl: string;
  groupsRefs: AngularFirestoreCollection<Group>[] = [];
  selectedGroup: Group;
  groups$: Observable<Group[]> = null;
  group$: Observable<Group[]> = null;
  groups: Group[] = [];
  userId: string;

  // Reference to the user's contact collection in Angular Firestore
  groupsRef: AngularFirestoreCollection<Group> = null;

  constructor(private db: AngularFireDatabase, 
    private afAuth: AngularFireAuth, 
    private afs: AngularFirestore,
    private notificationService: NotificationService,
    private userService: UserService) {
    // Just checks if a user exists and assigns this.userId to it.
    this.afAuth.authState.subscribe(user => {
      if(user) this.userId = user.uid
    })
    // if (localStorage.getItem('uid') != null)
    //   this.userId = localStorage.getItem('uid').replace(/\"/g, "")
  }

  // Sets groupRef and adds the new contact.
  createGroup(group: Group)  {
    this.afs.collection<User>('users').doc(this.userId).get().toPromise().then(doc => {
      let uuidValue = UUID.UUID();
      group.owner = this.userId;
      group.members.push(doc.data() as User)
      group.memberIDs.push(this.userId);
      group.id = uuidValue;
      this.afs.collection<Group>('groups').doc(uuidValue).set(JSON.parse(JSON.stringify(group)));
      // this.groupsRef.add(JSON.parse(JSON.stringify(group)));
      this.notificationService.notification$.next({message: group.name, action: 'Created!'});
      // this.updateGroupIDs(uuidValue);
    })
  }

  updateGroupIDs(value: string) {
    // this.userService.updateGroupIDs(value);
  }

  // Gets the document with the group's id and deletes it.
  deleteGroup(group: Group) {
    this.groupsRef = this.afs.collection<Group>('groups');
    this.groupsRef.doc(group.id).delete();
  }

  // Edits contact using the doc().update method.
  editGroup(group: Group, name, description)  {
    console.log(name + " " + description)
    this.groupsRef = this.afs.collection<Group>('groups');
    this.groupsRef.doc(group.id).update({name: name, description: description});
    this.notificationService.notification$.next({message: group.name, action: 'Edited!'});
  }

  getGroups(pathID) {
    let groupRef = this.afs.collection<Group>('groups', ref => ref.where("memberIDs", "array-contains", pathID));
    this.groups$ = groupRef.snapshotChanges().pipe(map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Group;
        const id = action.payload.doc.id;
        return { id, ...data };
      });
    }));
    return this.groups$;
  }

  getGroupsAlt() {
    return this.groups$;
  }
}

