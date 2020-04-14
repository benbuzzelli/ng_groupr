import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireDatabase } from "@angular/fire/database";
import { GroupService, Group } from '../group/group.service';
import { Router } from  "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DiscardDialogComponent } from '../discard-dialog/discard-dialog.component';
import { UserService, User } from '../user/user.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from '../notification.service';
import { firestore } from 'firebase';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.css']
})
export class EditGroupComponent implements OnInit {

  groupForm: FormGroup;
  group: Group;

  constructor(private groupService: GroupService, 
    private db: AngularFireDatabase,
    private notificationService: NotificationService,
    public router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private _editGroupDialogRef: MatDialogRef<EditGroupComponent>,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore, 
    @Inject(MAT_DIALOG_DATA) public _group: any,) { }

  ngOnInit(): void {
    this.initialiseForm();
  }

  initialiseForm() {
    this.group = this._group;
    this.groupForm = this.formBuilder.group({
      name: this.group.name,
      description: this.group.description
    })
    return this.groupForm;
  }

  // Creates a new contact with the input values from contactForm
  editGroup() {
    if (this.groupForm.get('name').value === '')
      return;
    let name = this.groupForm.get('name').value;
    let description = this.groupForm.get('description').value;
    this.groupService.editGroup(this._group, name, description);
    this._editGroupDialogRef.close('save');
  }

}
