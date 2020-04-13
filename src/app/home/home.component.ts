import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, } from '@angular/core';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  userId: string;
  user: User = null;
  selectedGroup: Group = new Group('Groups', 'Select a group to view messages');
  groups$: Observable<Group[]> = null;
  group$: Observable<Group[]> = null;
  messages$: Observable<Message[]> = null;
  groupRef: AngularFirestoreCollection<Group> = null;
  
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
      }
    })
  }

  ngOnInit(): void {
    this.groupService.getGroups();
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

  getGroups() {
    this.groups$ = this.groupService.getGroupsAlt();
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
    let dialogRef = this.dialog.open(InviteDialogComponent, {data: this.selectedGroup.collectionID, autoFocus: false});
    // dialogRef.afterClosed().subscribe(res => {
    //   if (res === "discard")
    //     this.router.navigate(['home']);
    //   else {
    //     document.getElementById('createGroup').blur();
    //   }
    // })
  }

  updateGroupIDs(value: string) {
    this.userService.updateGroupIDs(value);
  }

  changeGroup(group) {
    this.selectedGroup = group;
    this.updateMessages();
    this.scrollToBottom();
  }

  updateMessages() {
    this.groupRef = this.afs.collection<Group>(`groups-${this.selectedGroup.collectionID}`);
    this.group$ = this.groupRef.snapshotChanges().pipe(map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Group;
        this.scrollToBottom();
        return data;
      });
    }));
    this.scrollToBottom();
  }

  addMessage(value) {
    this.user = this.userService.user;
    this.groupRef = this.afs.collection<Group>(`groups-${this.selectedGroup.collectionID}`);
    this.groupRef.get().toPromise().then((res) => {
      res.forEach(group => {
        let data = group.data() as Group;
        let messages = data.messages as Message[];
        messages.push(this.messageService.getMessage(this.user.displayName, value));
        data.messages = messages;
        this.groupRef.doc(this.selectedGroup.id).update({messages: JSON.parse(JSON.stringify(messages))});
        this.scrollToBottom();
      });
    })
    this.scrollToBottom();
  }
}
