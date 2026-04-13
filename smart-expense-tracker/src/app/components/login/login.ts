import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  isLoginMode = false;
  showWelcomePopup = false;

  // Validation state
  emailTouched = false;
  passwordTouched = false;

  // Avatars for signup
  avatars = ['face', 'sentiment_satisfied', 'mood', 'emoji_emotions', 'account_circle', 'person_outline'];
  selectedAvatar = this.avatars[0];


  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Show welcome popup, auto-dismiss after 4 seconds
    this.showWelcomePopup = true;
    setTimeout(() => this.showWelcomePopup = false, 4000);
  }

  get emailError(): string {
    if (!this.emailTouched) return '';
    if (!this.email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) return 'Please enter a valid email';
    return '';
  }

  get passwordError(): string {
    if (!this.passwordTouched) return '';
    if (!this.password) return 'Password is required';
    if (this.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }

  get formValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email) && this.password.length >= 6;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.emailTouched = false;
    this.passwordTouched = false;
    this.email = '';
    this.password = '';
    this.selectedAvatar = this.avatars[0];
  }

  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.formValid) return;

    this.isLoading = true;

    // Simulate network delay for a polished feel
    setTimeout(() => {
      const result = this.isLoginMode 
        ? this.authService.login(this.email, this.password)
        : this.authService.register(this.email, this.password);

      if (result.success) {
        this.toastService.show(this.isLoginMode ? 'Welcome back! 🎉' : result.message, 'success');
        this.router.navigate(['/dashboard']);
      } else {
        this.toastService.show(result.message, 'error');
      }

      this.isLoading = false;
    }, 800);
  }
}
