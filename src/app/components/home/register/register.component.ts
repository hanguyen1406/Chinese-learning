import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth/auth.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  isSignUpFailed = false;
  errorMessage = '';
  hidePassword = true;

  // OTP states
  step: 'form' | 'otp' = 'form'; // Bước hiện tại
  otpCode = '';
  otpSent = false;
  otpVerified = false;
  countdown = 0;
  countdownInterval: any;

  formRegistrationUser: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null),
    surname: new FormControl(null),
    username: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {}

  // Bước 1: Gửi OTP
  sendOtp(): void {
    if (
      !this.formRegistrationUser.get('email')?.valid ||
      !this.formRegistrationUser.get('username')?.valid
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập username và email hợp lệ',
        showClass: { popup: '' },
        hideClass: { popup: '' },
      });
      return;
    }

    const email = this.formRegistrationUser.get('email')?.value;
    const username = this.formRegistrationUser.get('username')?.value;

    Swal.fire({
      title: 'Đang gửi OTP...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showClass: { popup: '' },
      hideClass: { popup: '' },
    });

    this.authService.sendOtp(email, username).subscribe({
      next: () => {
        Swal.close();
        this.otpSent = true;
        this.step = 'otp';
        this.startCountdown();
        Swal.fire({
          icon: 'success',
          title: 'Đã gửi OTP',
          text: `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra email.`,
          timer: 3000,
          showConfirmButton: false,
          showClass: { popup: '' },
          hideClass: { popup: '' },
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err?.error?.message || 'Không thể gửi OTP. Vui lòng thử lại.',
          showClass: { popup: '' },
          hideClass: { popup: '' },
        });
      },
    });
  }

  // Bắt đầu đếm ngược 60 giây
  startCountdown(): void {
    this.countdown = 60;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  // Gửi lại OTP
  resendOtp(): void {
    if (this.countdown > 0) return;
    this.sendOtp();
  }

  // Bước 2: Xác thực OTP
  verifyOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'OTP không hợp lệ',
        text: 'Vui lòng nhập mã OTP 6 số',
        showClass: { popup: '' },
        hideClass: { popup: '' },
      });
      return;
    }

    const email = this.formRegistrationUser.get('email')?.value;

    Swal.fire({
      title: 'Đang xác thực...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showClass: { popup: '' },
      hideClass: { popup: '' },
    });

    this.authService.verifyOtp(email, this.otpCode).subscribe({
      next: () => {
        Swal.close();
        this.otpVerified = true;
        // Sau khi verify thành công, tự động đăng ký
        this.saveUser();
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'OTP không đúng',
          text: err?.error?.message || 'Mã OTP không đúng hoặc đã hết hạn',
          showClass: { popup: '' },
          hideClass: { popup: '' },
        });
      },
    });
  }

  // Bước 3: Đăng ký tài khoản
  saveUser(): void {
    if (this.formRegistrationUser.valid) {
      Swal.fire({
        title: 'Đang đăng ký...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        showClass: { popup: '' },
        hideClass: { popup: '' },
      });

      this.authService.register(this.formRegistrationUser.value).subscribe({
        next: () => {
          Swal.close();
          this.isSignUpFailed = false;
          this.formRegistrationUser.reset();

          Swal.fire({
            icon: 'success',
            title: 'Đăng ký thành công!',
            text: 'Bạn có thể đăng nhập ngay bây giờ',
            showClass: { popup: '' },
            hideClass: { popup: '' },
          }).then(() => {
            this.router.navigate(['login']);
          });
        },
        error: (err) => {
          Swal.close();
          this.errorMessage = err?.error?.message || 'Đăng ký thất bại';
          this.isSignUpFailed = true;
          Swal.fire({
            icon: 'error',
            title: 'Đăng ký thất bại',
            text: this.errorMessage,
            showClass: { popup: '' },
            hideClass: { popup: '' },
          });
        },
      });
    }
  }

  // Quay lại bước nhập form
  backToForm(): void {
    this.step = 'form';
    this.otpCode = '';
  }

  cancel() {
    this.formRegistrationUser.reset();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.location.back();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
