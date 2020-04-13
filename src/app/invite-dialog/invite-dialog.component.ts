import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.css']
})
export class InviteDialogComponent implements OnInit {
  groupID: string = "hello";
  constructor(@Inject(MAT_DIALOG_DATA) public _groupID: any,) { }

  ngOnInit(): void {
    this.groupID = this._groupID;
  }

    getGroupID() {
      return this.groupID;
    }
}
