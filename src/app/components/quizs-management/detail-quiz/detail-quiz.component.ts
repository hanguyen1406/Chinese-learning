import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AddQuestionComponent } from './add-question/add-question.component';
import { MatDialog } from '@angular/material/dialog';
import { Question } from '../../../model/question';
import { QuestionService } from '../../../service/question/question.service';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Quiz } from '../../../model/quiz';
import { QuizService } from '../../../service/quiz/quiz.service';
import { interval, Subscription } from 'rxjs';
import { AnswerQuestion } from '../../../model/answerQuestion';
import { ScoreQuiz } from '../../../model/scoreQuiz';

@Component({
  selector: 'app-detail-quiz',
  templateUrl: './detail-quiz.component.html',
  styleUrls: ['./detail-quiz.component.css'],
})
export class DetailQuizComponent implements OnInit, OnDestroy {
  idQuiz!: string;
  quiz: Quiz;
  role: string = '';
  questions: Question[] = [];
  selectedQues!: FormGroup;
  isUpdating = false;
  currentQuestionId: number | null = null;
  currentQuestionIndex: number = 0;
  isReviewMode = false;
  correctAnswer = ''; // lấy từ backend
  userAnswer = '';
  // Timer
  displayTime: string = '00:00';
  private timerSubscription!: Subscription;
  private timeLeft: number = 0; // tính bằng giây
  score: number = 0;

  constructor(
    private tokenStorageService: TokenStorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private questionService: QuestionService,
    private quizService: QuizService,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.idQuiz = this.route.snapshot.paramMap.get('idQuiz')!;
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    } else {
      this.role = 'ROLE_USER';
      let view = this.route.snapshot.queryParamMap.get('view'); // → 'result'
      // console.log('view',view);

      if (view && view == 'result') {
        this.getResultQuiz();
      } else {
        this.getAllQuestions();
      }
      this.selectedQues.get('answer')?.valueChanges.subscribe((newValue) => {
        // console.log('User selected answer:', newValue);
        this.questions[this.currentQuestionIndex].answer = newValue;
        //gọi api cập nhật lựa chọn của user
        let answerQuestion: AnswerQuestion = {
          id: null,
          userId: null,
          quizId: +this.idQuiz,
          questionId: this.currentQuestionId!,
          userAnswer: newValue,
          answeredAt: new Date(),
        };
        this.quizService.answerQuestion(answerQuestion).subscribe((res) => {});
      });
    }
    this.getQuizById();

    // Lắng nghe mọi thay đổi trong FormGroup
    this.selectedQues.valueChanges.subscribe(() => {
      this.isUpdating = true;
    });
  }
  checkDoing() {
    this.quizService.checkDoing(+this.idQuiz).subscribe({
      next: (res) => {
        this.questions.forEach((q) => {
          const answeredQues = res.questions.find((r) => r.id === q.id);
          if (answeredQues) {
            q.answer = answeredQues.answer;
          }
        });
        this.selectQues(this.questions[0]);
        this.startTimer(res.timeLeft); // res.timeLeft tính bằng phút
        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.INFO,
          header: 'Thông báo',
          messages: ['Bạn đang làm bài thi này, vui lòng hoàn thành.'],
          delay: 5000,
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      },
      error: (err) => {
        const result = window.confirm('Xác nhận làm bài kiểm tra này?');
        if (result) {
          // Người dùng nhấn OK là xác nhận làm bài, gọi API cập nhật 1 câu hỏi
          // để lưu thời gian người dùng bắt đầu làm bài
          const startTime = new Date(); // thời điểm bắt đầu
          const finishedAt = new Date(
            startTime.getTime() + this.quiz.timeQuiz * 60 * 1000
          );

          let scoreQuiz: ScoreQuiz = {
            id: null,
            quizId: +this.idQuiz,
            userId: null,
            score: null,
            started_at: startTime,
            finished_at: finishedAt,
          };
          this.quizService.doingQuiz(scoreQuiz).subscribe((res) => {
            this.startTimer(this.quiz.timeQuiz * 60); // chuyển phút -> giây
          });
        } else {
          // Người dùng nhấn Cancel
          this.router.navigate(['/quizs']);
        }
      },
    });
  }
  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Khởi tạo form
  initForm() {
    this.selectedQues = this.fb.group({
      id: [null],
      content: ['', Validators.required],
      a: ['', Validators.required],
      b: ['', Validators.required],
      c: ['', Validators.required],
      d: ['', Validators.required],
      answer: ['', Validators.required],
      explanation: [''],
      image_url: [
        '',
        Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i),
      ],
    });
  }

  // Timer
  startTimer(seconds: number) {
    this.timeLeft = seconds; // phút -> giây
    this.updateDisplayTime();

    const timer$ = interval(1000); // tick mỗi giây
    this.timerSubscription = timer$.subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplayTime();
      } else {
        this.stopTimer();
        this.timeUp();
      }
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateDisplayTime() {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    this.displayTime = `${this.pad(m)}:${this.pad(s)}`;
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  timeUp() {
    // Khi hết giờ, có thể tự động nộp bài hoặc thông báo
    this.ngxNotificationMsgService.open({
      status: NgxNotificationStatusMsg.FAILURE,
      header: 'Hết giờ',
      messages: ['Thời gian làm bài đã kết thúc!'],
      direction: NgxNotificationDirection.BOTTOM_RIGHT,
    });
    this.submitQuiz();
  }
  getResultQuiz() {
    this.isReviewMode = true;
    this.quizService.getResultQuiz(+this.idQuiz).subscribe({
      next: (res) => {
        this.questions = res.questions;
        this.score = res.score;
        this.selectQues(this.questions[0]);
      },
      error: (err) => {
        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.FAILURE,
          header: 'Lỗi',
          messages: [err.error?.message || 'Lấy kết quả thất bại'],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      },
    });
  }
  submitQuiz() {
    //cập nhật finished_at
    this.stopTimer();
    this.quizService.submitQuiz(+this.idQuiz).subscribe({
      next: (res) => {
        this.getResultQuiz();
      },
      error: (err) => {
        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.FAILURE,
          header: 'Lỗi',
          messages: [err.error?.message || 'Có lỗi khi nộp bài'],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      },
    });
  }
  // Lấy quiz
  getQuizById() {
    this.quizService.getQuizById(+this.idQuiz).subscribe((res) => {
      this.quiz = res;
    });
  }

  getAllQuestions() {
    this.questionService.getQuesOfQuiz(+this.idQuiz).subscribe((res) => {
      this.questions = res;
      if (res.length > 0) {
        this.selectQues(res[0]);
        if (this.role == 'ROLE_USER') {
          this.checkDoing();
        }
      }
    });
  }

  selectQues(ques: Question, index?: number) {
    this.currentQuestionId = ques.id || null;
    this.currentQuestionIndex = index !== undefined ? index : 0;
    if (this.role == 'ROLE_USER' && this.isReviewMode) {
      this.correctAnswer = ques.answer || '';
      this.userAnswer = ques.userAnswer || '';
    }
    this.selectedQues.patchValue(
      { answer: '', image_url: '' },
      { emitEvent: false }
    );
    this.selectedQues.patchValue(ques, { emitEvent: false });
    this.isUpdating = false;
  }

  updateQuestion() {
    if (!this.selectedQues.valid || !this.currentQuestionId) {
      this.ngxNotificationMsgService.open({
        status: NgxNotificationStatusMsg.FAILURE,
        header: 'Lỗi',
        messages: ['Vui lòng điền đúng thông tin'],
        direction: NgxNotificationDirection.BOTTOM_RIGHT,
      });
      return;
    }

    this.isUpdating = true;

    const updatedQuestion: Question = {
      ...this.selectedQues.value,
      quizId: +this.idQuiz,
    };

    this.questionService.update(updatedQuestion).subscribe({
      next: (response) => {
        this.isUpdating = false;

        // Cập nhật lại câu hỏi trong danh sách
        this.questions[this.currentQuestionIndex] = response as Question;

        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.SUCCESS,
          header: 'Thành công',
          messages: ['Cập nhật câu hỏi thành công'],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      },
      error: (err) => {
        this.isUpdating = false;

        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.FAILURE,
          header: 'Lỗi',
          messages: [err.error?.message || 'Cập nhật thất bại'],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      },
    });
  }

  resetForm() {
    if (this.currentQuestionId) {
      const original = this.questions.find(
        (q) => q.id === this.currentQuestionId
      );

      if (original) {
        this.selectQues(original);

        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.INFO,
          header: 'Thông báo',
          messages: ['Đã làm mới form'],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
        });
      }
    }
  }

  openCreate() {
    const dialogRef = this.dialog.open(AddQuestionComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: Question | Question[]) => {
      if (result) {
        if (Array.isArray(result)) {
          // result là mảng Question[]
          result.forEach((q) => {
            q.quizId = +this.idQuiz;
            q.answer = q.answer?.toLowerCase();
          });
          this.questionService.createBatch(result).subscribe({
            next: (newQuestion) => {
              this.getAllQuestions();
              this.ngxNotificationMsgService.open({
                status: NgxNotificationStatusMsg.SUCCESS,
                header: 'Thành công',
                messages: ['Thêm câu hỏi thành công'],
                direction: NgxNotificationDirection.BOTTOM_RIGHT,
              });
            },
            error: (err) => {
              this.ngxNotificationMsgService.open({
                status: NgxNotificationStatusMsg.FAILURE,
                header: 'Lỗi',
                messages: [err.error?.message || 'Thêm câu hỏi thất bại'],
                direction: NgxNotificationDirection.BOTTOM_RIGHT,
              });
            },
          });
        } else {
          // result là 1 Question duy nhất
          result.quizId = +this.idQuiz;
          this.questionService.create(result).subscribe({
            next: (newQuestion) => {
              this.getAllQuestions();
              this.ngxNotificationMsgService.open({
                status: NgxNotificationStatusMsg.SUCCESS,
                header: 'Thành công',
                messages: ['Thêm câu hỏi thành công'],
                direction: NgxNotificationDirection.BOTTOM_RIGHT,
              });
            },
            error: (err) => {
              this.ngxNotificationMsgService.open({
                status: NgxNotificationStatusMsg.FAILURE,
                header: 'Lỗi',
                messages: [err.error?.message || 'Thêm câu hỏi thất bại'],
                direction: NgxNotificationDirection.BOTTOM_RIGHT,
              });
            },
          });
        }
      }
    });
  }
  reDoQuiz() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/quizs', this.idQuiz], { queryParams: {} });
    });
  }
  exit() {
    this.router.navigate(['/quizs']);
  }
  isQuestionSelected(ques: Question): boolean {
    return this.currentQuestionId === ques.id;
  }
}
