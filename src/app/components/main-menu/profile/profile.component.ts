import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../model/user';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { UserService } from '../../../service/user/user.service';
import { City, Country } from 'country-state-city';
import { Router } from '@angular/router';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';
import { Adress } from '../../../model/adress';
import { QuizService } from '../../../service/quiz/quiz.service';
import { QuizHistory } from '../../../model/quizHistory';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User;
  userAdress: Adress;
  roles: String[] = [];
  kliknut = false;
  password: String = '';

  //address
  countrys: String[] = [];
  citys: String[] = [];

  full: boolean;
  isFailed = false;
  errorMessage = '';

  // Quiz history
  quizHistory: QuizHistory[] = [];
  showAllHistory = false;

  formCreateEditUser: FormGroup = new FormGroup({
    id: new FormControl(null),
    email: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    surname: new FormControl(null, [Validators.required]),
    username: new FormControl(null, [Validators.required]),
    roles: new FormControl(null),
    phone: new FormControl(null),
    dateOfBirth: new FormControl(null),
  });

  constructor(
    private token: TokenStorageService,
    public us: UserService,
    private router: Router,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const currentUser = this.token.getUser();

    this.us.getOne(currentUser.username).subscribe((user: User) => {
      console.log(user);
      this.user = user;
      this.formCreateEditUser.patchValue(user);

      // Format date for input
      if (user.dateOfBirth) {
        const date = new Date(user.dateOfBirth);
        const formattedDate = date.toISOString().split('T')[0];
        this.formCreateEditUser.patchValue({ dateOfBirth: formattedDate });
      }

      for (let role of user.roles) {
        if (role.name.toString() == 'ROLE_ADMINISTRATOR') {
          this.roles.push('Administrator');
        } else if (role.name.toString() == 'ROLE_USER') {
          this.roles.push('User');
        } else {
          this.roles.push(role.name.toString());
        }
      }
    });

    // Load quiz history
    this.loadQuizHistory();
  }

  loadQuizHistory(): void {
    this.quizService.getQuizHistory().subscribe({
      next: (history) => {
        this.quizHistory = history;
      },
      error: (err) => {
        console.error('Error loading quiz history:', err);
      },
    });
  }

  viewQuizResult(quizId: number): void {
    this.router.navigate(['/quizs', quizId], {
      queryParams: { view: 'result' },
    });
  }

  toggleHistoryView(): void {
    this.showAllHistory = !this.showAllHistory;
  }

  getScoreClass(score: number): string {
    const percentage = (score / 10) * 100;
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
  }

  saveUser() {
    if (this.formCreateEditUser.valid) {
      if (this.password != null) {
        this.formCreateEditUser.patchValue({ ['password']: this.password });
      }

      //Logout when user change username
      if (this.formCreateEditUser.value['username'] != this.user.username) {
        this.us
          .update(
            this.formCreateEditUser.value.id,
            this.formCreateEditUser.value
          )
          .subscribe((x) => {
            this.token.signOut();
            window.location.href = 'login';
          });
      } else {
        this.us
          .update(
            this.formCreateEditUser.value.id,
            this.formCreateEditUser.value
          )
          .subscribe((x) => {
            this.us.getOne(this.user.username).subscribe((user: User) => {
              this.user = user;
              this.formCreateEditUser.patchValue(user);
              this.ngxNotificationMsgService.open({
                status: NgxNotificationStatusMsg.SUCCESS,
                header: 'Cập nhật hồ sơ',
                messages: ['Bạn đã cập nhật hồ sơ thành công.'],
                direction: NgxNotificationDirection.BOTTOM_RIGHT,
              });
            });
          });
      }
    } else {
      this.errorMessage = 'Bạn phải điền đủ thông tin!';
      this.isFailed = true;
    }
  }

  details() {
    this.kliknut = true;
  }

  hideDet() {
    this.kliknut = false;
  }

  getAverageScore(): number {
    if (this.quizHistory.length === 0) return 0;
    const totalScore = this.quizHistory.reduce(
      (sum, quiz) => sum + quiz.score,
      0
    );
    return totalScore / this.quizHistory.length;
  }

  checkU() {
    // Method placeholder for username check
  }
}
