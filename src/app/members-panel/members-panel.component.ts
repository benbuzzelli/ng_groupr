import { Component, OnInit } from '@angular/core';
import { Group, GroupService } from '../group/group.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-members-panel',
  templateUrl: './members-panel.component.html',
  styleUrls: ['./members-panel.component.css']
})
export class MembersPanelComponent implements OnInit {
  group$: Observable<Group[]> = null;

  constructor(private groupService: GroupService) { }

  ngOnInit(): void {
    this.group$ = this.groupService.group$;
    console.log(this.group$)
  }

}
