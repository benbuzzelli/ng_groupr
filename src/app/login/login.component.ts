import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from  "@angular/router";
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(private authService: AuthService, 
    private formBuilder: FormBuilder, public router: Router) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: '',
      password: ''
    })

    this.loginForm.valueChanges.subscribe(console.log)
  }

  async login(email: string, password: string) {
    this.authService.login(email, password);
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
