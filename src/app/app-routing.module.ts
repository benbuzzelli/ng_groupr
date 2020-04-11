import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from  './login/login.component';
import { HomeComponent } from  './home/home.component';
import { RegisterComponent } from  './register/register.component';
// import { ForgotPasswordComponent } from  './forgot-password/forgot-password.component';
import { VerifyEmailComponent } from  './verify-email/verify-email.component';
import { AuthGuard } from './auth/auth.guard';

const appRoutes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path:  'login',component:  LoginComponent},
  { path:  'register', component:  RegisterComponent },
  // { path:  'forgot-password', component:  ForgotPasswordComponent },
  { path:  'verify-email', component:  VerifyEmailComponent },
  // { path:  'contacts',component:  ContactsComponent, canActivate: [AuthGuard]},
  { path:  'home',component:  HomeComponent, canActivate: [AuthGuard]},
  // { path:  'edit-contact',component:  EditContactComponent, canActivate: [AuthGuard]},
  // { path:  'forgot-password',component:  ViewContactsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }