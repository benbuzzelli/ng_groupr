import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../auth/auth.service';
import { UserService } from  '../user/user.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from  "@angular/router";
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { NotificationService } from '../notification.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  showPassword = false;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  firstNameFormControl = new FormControl('', [
    Validators.maxLength(25),
    Validators.pattern('^[0-9 ]*'),
    Validators.required
  ]);

  lastNameFormControl = new FormControl('', [
    Validators.maxLength(30),
    Validators.pattern('^[0-9 ]*'),
    Validators.required
  ]);

  nicknameFormControl = new FormControl('', [
    Validators.maxLength(75),
    Validators.pattern('^[0-9 ]*'),
    Validators.required
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(private authService: AuthService, 
    private userService: UserService, 
    private formBuilder: FormBuilder,
    public router: Router,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: '',
      password: '',
      first: '',
      last: '',
      nickname: ''
    })
  }

  async register() {
    let email = this.registerForm.get('email').value;
    let password = this.registerForm.get('password').value;
    let first = this.registerForm.get('first').value;
    let last = this.registerForm.get('last').value;
    let nickname = this.registerForm.get('nickname').value;
    this.authService.register(email, password, first, last, nickname);
    // this.authService.logoutNoMessage();
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
