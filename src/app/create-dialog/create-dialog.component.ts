import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from "@angular/fire/database";
import { GroupService, Group } from '../group/group.service';
import { Router } from  "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DiscardDialogComponent } from '../discard-dialog/discard-dialog.component';
import { UserService, User } from '../user/user.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.css']
})
export class CreateDialogComponent implements OnInit {
  join: boolean = false;
  joinGroupForm: FormGroup;
  groupForm: FormGroup;
  group: Group; 

  constructor(private groupService: GroupService, 
    private db: AngularFireDatabase,
    private notificationService: NotificationService,
    public router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private _createGroupDialogRef: MatDialogRef<CreateDialogComponent>,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore) {}

  ngOnInit(): void {
    document.getElementById('backspaceButton')?.blur();
    this.initialiseForm();
  }

  initialiseForm() {
    this.groupForm = this.formBuilder.group({
      name: '',
      description: ''
    })
    this.joinGroupForm = this.formBuilder.group({
      groupID: ''
    })
    return this.groupForm;
  }

  // Opens the edit dialog to give a user the option to either discard their changes,
  // or keep creating the new contact.
  openDiscardDialog() {
    if (!this.formIsChanged()) {
      this._createGroupDialogRef.close('back to contact');
      return;
    }

    let dialogRef = this.dialog.open(DiscardDialogComponent);

    dialogRef.afterClosed().subscribe(res => {
      if (res === "discard") {
        this._createGroupDialogRef.close('back to contact');
      } else {
        document.getElementById('backspaceButton').blur();
      }
    })
  }

  closeDialogAndCreateGroup() {
    this.createGroup()
    this._createGroupDialogRef.close('save');
  }

  closeDialogAndJoinGroup() {
    this.joinGroup();
  }

  joinGroup() {
    this.updateGroupIDs(this.joinGroupForm.get('groupID').value);
  }

  updateGroupIDs(value: string) {
    let doc = this.afs.collection<User>(`user-${this.userService.userId}`);

    doc.get().toPromise().then((res) => {
      res.forEach(user => {
        let data = user.data();
        let id = user.id;
        let groupIDs = data.groupIDs === undefined ? [value] : data.groupIDs;
        groupIDs.push(value);
        let groupRef = this.afs.collection<User>(`groups-${value}`);
        groupRef.get().toPromise().then( doc => {
          if (doc.empty) {
            this.notificationService.notification$.next({message: 'Group ID', action: 'DOES NOT EXIST!'});
          } else {
            this.afs.collection<User>(`user-${this.userService.userId}`).doc(id).update({groupIDs: groupIDs});
            this._createGroupDialogRef.close('save');
          }
        });
      })
    })
  }

  // Creates a new contact with the input values from contactForm
  createGroup() {
    let name = this.groupForm.get('name').value;
    let description = this.groupForm.get('description').value;
    this.group = new Group(name, description);
    this.groupService.createGroup(this.group);
  }

  // Checks all formGroup values to see if the form is filled
  formIsChanged(): boolean {
    return this.groupForm.dirty;
  }

  toggleJoin() {
    this.join = !this.join;
  }
}
