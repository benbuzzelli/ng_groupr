import { Component } from '@angular/core';
import { NotificationService } from './notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-groupr';

  constructor(
    private notificationService: NotificationService, private snackBar: MatSnackBar
  ) {
    this.notificationService.notification$.subscribe(value => {
      this.snackBar.open(value.message, value.action, {
        duration: 2500,
      });
    });
  }
}
