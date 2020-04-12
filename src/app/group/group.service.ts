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
  collectionID: string;
  id: string;
  name: string;
  description: string;
  members: string[];
  messages: Message[];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.messages = [];
  }
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  
  baseDBUrl: string;
  groupsRefs: AngularFirestoreCollection<Group>[] = [];
  groups$: Observable<Group[]> = null;
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
    let uuidValue = UUID.UUID();
    group.collectionID = uuidValue;
    this.groupsRef = this.afs.collection<Group>(`groups-${uuidValue}`);
    this.groupsRef.add(JSON.parse(JSON.stringify(group)));
    this.notificationService.notification$.next({message: group.name, action: 'Created!'});
    this.updateGroupIDs(uuidValue);
  }

  updateGroupIDs(value: string) {
    this.userService.updateGroupIDs(value);
  }

  // Gets the document with the group's id and deletes it.
  deleteContact(group: Group) {
    this.groupsRef = this.afs.collection<Group>(`groups-${this.userId}`);
    this.groupsRef.doc(group.id).delete();
  }

  // Edits contact using the doc().update method.
  editGroup(group: Group)  {
    this.groupsRef = this.afs.collection<Group>(`groups-${this.userId}`);
    this.groupsRef.doc(group.id).update(JSON.parse(JSON.stringify(group)));
    this.notificationService.notification$.next({message: group.name, action: 'Edited!'});
  }

  // editUserGroupID(id: string)  {
  //   this.userRef = this.afs.collection<User>(`groups-${this.userId}`);
  //   this.groupsRef.doc(group.id).update(JSON.parse(JSON.stringify(group)));
  // }

  getGroups() {
    let doc = this.afs.collection<User>(`user-${this.userId}`);
    doc.get().toPromise().then((res) => {
      res.forEach(user => {
        let data = user.data();
        let groupIDs = data.groupIDs as string[];
        let l = groupIDs.length;
        let groups: Group[] = [];
        for (let i = 0; i < l; i++) {
          let path = 'groups-' + groupIDs[i];
          this.groupsRefs[i] = this.afs.collection<Group>(path, ref => ref.orderBy('name'));
          this.groupsRefs[i].get().toPromise().then((res) => {
            res.forEach(group => {
              let data = group.data() as Group;
              data.id = group.id;
              groups.push(data);
              this.groups$ = of(groups);
              if (this.groups$ != null && this.groups$ != undefined) {
                this.getGroupsAlt();
              }
              return groups;
            });
          })
        }
      });
    })
    // if (this.groupsRefs != null) {
    // this.groups$ = this.groupsRefs[0].snapshotChanges().pipe(map(actions => {
    //     return actions.map(action => {
    //       const data = action.payload.doc.data() as Group;
    //       const id = action.payload.doc.id;
    //       console.log(id);
    //       return { id, ...data };
    //     });
    //   }));
    // }
    return this.groups$;
  }

  getGroupsAlt() {
    return this.groups$;
  }
}

