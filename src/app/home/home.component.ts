import { Pipe, PipeTransform, Component, OnInit, AfterViewChecked, ElementRef, ViewChild, } from '@angular/core';
import {  } from '@angular/common';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from  "@angular/fire/auth";
import { Router } from  "@angular/router";
import { Group, GroupService } from '../group/group.service';
import { Observable, of } from 'rxjs';
import { UserService, User } from '../user/user.service';
import { map } from 'rxjs/operators';
import { Message, MessageService } from '../message/message.service';
import { firestore } from 'firebase';

@Pipe({
  name: 'displayName',
  pure: true
})
export class DisplayNamePipe implements PipeTransform {
  constructor(private messageService: MessageService) { }
  transform(message: any, args?: any): any {
    return this.messageService.getDisplayName(message);
  }
}

@Pipe({
  name: 'displayTime',
  pure: true
})
export class DisplayTimePipe implements PipeTransform {
  constructor(private messageService: MessageService) { }
  transform(message: any, args?: any): any {
    return this.messageService.getDisplayTime(message);
  }
}

@Pipe({
  name: 'divider',
  pure: true
})
export class MessageDividerPipe implements PipeTransform {
  constructor(private messageService: MessageService) { }
  transform(message: any, args?: any): any {
    return this.messageService.getDividerString(message);
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  messageInput: string = '';
  userId: string;
  user: User = null;
  selectedGroup: Group = new Group('Groups', 'Select a group to view messages');
  groups$: Observable<Group[]> = null;
  group$: Observable<Group[]> = null;
  messages$: Observable<Message[]> = null;
  groupRef: AngularFirestoreCollection<Group> = null;
  showMembersToggle: boolean = false;
  
  constructor(private afAuth: AngularFireAuth,
    public router: Router, 
    public dialog: MatDialog, 
    private groupService: GroupService,
    private userService: UserService,
    private afs: AngularFirestore,
    private messageService: MessageService) {

    this.afAuth.authState.subscribe(user => {
      if(user) {
        this.userId = user.uid
        this.userService.setUser(this.userId);
        this.getGroups(this.userId);
      }
    })
  }

  ngOnInit(): void {
    this.selectedGroup.owner = 'default';
    this.groups$ = this.groupService.groups$;
    this.scrollToBottom();
  }

  ngAfterViewChecked() {        
      this.scrollToBottom();        
  }

  scrollToBottom(): void {
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }                 
  }

  getGroups(id) {
    this.groups$ = this.groupService.getGroups(id);
  }

  // Opens the edit dialog to give a user the option to either discard their changes,
  // or keep creating the new contact.
  openCreateDialog() {
    let dialogRef = this.dialog.open(CreateDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res === "discard")
        this.router.navigate(['home']);
      else {
        document.getElementById('createGroup').blur();
      }
    })
  }

  openInviteDialog() {
    if (this.selectedGroup.owner === 'default')
      return;
    let dialogRef = this.dialog.open(InviteDialogComponent, {data: this.selectedGroup.id, autoFocus: false});
  }

  updateGroupIDs(value: string) {
    // this.userService.updateGroupIDs(value);
  }

  changeGroup(group) {
    this.selectedGroup = group;
    this.groupService.selectedGroup = group;
    this.updateMessages();
    this.scrollToBottom();
  }

  updateMessages() {
    this.groupRef = this.afs.collection<Group>('groups', ref => ref.where("id", "==", this.selectedGroup.id));
    this.group$ = this.groupRef.snapshotChanges().pipe(map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Group;
        this.scrollToBottom();
        return data;
      });
    }));
    this.groupService.group$ = this.group$;
    this.scrollToBottom();
  }

  addMessage(value) {
    this.messageInput = '';
    if (value === '' || this.selectedGroup.owner === 'default')
      return;
    let groupRef = this.afs.collection<Group>('groups').doc(this.selectedGroup.id);
    groupRef.get().toPromise().then(doc => {
        let g = doc.data() as Group;
        let previousMessage = g.messages.pop();
        this.user = this.userService.user;
        let date = (previousMessage === undefined || previousMessage === null) ? null : previousMessage.date;
        let id = (previousMessage === undefined || previousMessage === null) ? '' : previousMessage.user.id;
        let prevTimestamp = (previousMessage === undefined || previousMessage === null) ? '' : previousMessage.timestamp;
        this.messageService.addMessage(value, this.selectedGroup.id, date, id, prevTimestamp)
        this.scrollToBottom();
    });

    // if (value === '')
    //   return;
    // this.user = this.userService.user;
    // this.messageService.addMessage(value, this.selectedGroup.id)
    // this.scrollToBottom();
    // this.message = '';
  }

  showMembers() {
    if (this.selectedGroup.owner === 'default')
      return;
    this.showMembersToggle = !this.showMembersToggle;
  }
}
