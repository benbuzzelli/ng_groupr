import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from  "@angular/router";
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { NotificationService } from '../notification.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.value != '' || control.touched || isSubmitted));
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

  matcher = new MyErrorStateMatcher();

  constructor(private authService: AuthService, 
    private formBuilder: FormBuilder,
    public router: Router,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: '',
      password: ''
    })

    this.registerForm.valueChanges.subscribe(console.log)
  }

  async register(email: string, password: string) {
    this.authService.register(email, password);
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
