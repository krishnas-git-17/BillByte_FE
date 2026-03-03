import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  standalone: true,               // ✅ standalone
  imports: [
    CommonModule,
    ReactiveFormsModule            // ✅ REQUIRED
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  otpForm!: FormGroup;

  step: 'SIGNUP' | 'OTP' = 'SIGNUP';
  emailForOtp = '';
  loading = false;
  errorMsg = '';
  plans: any[] = [];

  constructor(
    private fb: FormBuilder,
    private signupService: SignupService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      restaurantName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      planId: [null, Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loadPlans();
    this.cdr.detectChanges();
  }

  loadPlans() {
    this.signupService.getPlans().subscribe({
      next: (res) => this.plans = res,
      error: () => this.errorMsg = 'Failed to load plans'
    });
  }

  selectPlan(planId: number) {
    this.signupForm.patchValue({ planId });
  }

  submit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.signupService.signup(this.signupForm.value).subscribe({
      next: () => {
        this.emailForOtp = this.signupForm.value.email;
        this.step = 'OTP';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error || 'Signup failed';
        this.loading = false;
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    this.signupService.verifyEmail({
      email: this.emailForOtp,
      otp: this.otpForm.value.otp
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.errorMsg = err?.error || 'Invalid OTP';
        this.loading = false;
      }
    });
  }
}
