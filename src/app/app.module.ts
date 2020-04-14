import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { ReactiveFormsModule , FormsModule } from '@angular/forms';
// import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
// import { VerifyEmailComponent } from './verify-email/verify-email.component';

import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { MatIconModule } from '@angular/material/icon';

import { AuthGuard } from './auth/auth.guard';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { HomeComponent, DisplayNamePipe, DisplayTimePipe, MessageDividerPipe } from './home/home.component';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { DiscardDialogComponent } from './discard-dialog/discard-dialog.component';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';

import { ClipboardModule } from '@angular/cdk/clipboard';
import { MembersPanelComponent } from './members-panel/members-panel.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { EditGroupComponent } from './edit-group/edit-group.component'

const appRoutes: Routes = [
  { path:  'login',component:  LoginComponent},
  { path:  'register', component:  RegisterComponent },
  // { path:  'forgot-password', component:  ForgotPasswordComponent },
  { path:  'verify-email', component:  VerifyEmailComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    // ForgotPasswordComponent,
    VerifyEmailComponent,
    ToolbarComponent,
    HomeComponent,
    CreateDialogComponent,
    DiscardDialogComponent,
    InviteDialogComponent,
    MembersPanelComponent,
    DisplayNamePipe,
    DisplayTimePipe,
    MessageDividerPipe,
    DeleteDialogComponent,
    EditGroupComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }
    ),
    BrowserModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MaterialModule,
    MatIconModule,
    AppRoutingModule,
    ClipboardModule
  ],
  // entryComponents: [EditDialogComponent, DeleteDialogComponent, SaveChangesDialogComponent, ContactDialog, EditContactComponent],
  providers: [AuthGuard, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
