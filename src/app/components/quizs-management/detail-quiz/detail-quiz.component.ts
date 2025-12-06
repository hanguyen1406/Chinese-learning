import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { ActivatedRoute } from '@angular/router';
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

  // Timer
  displayTime: string = '00:00';
  private timerSubscription!: Subscription;
  private timeLeft: number = 0; // tính bằng giây

  constructor(
    private tokenStorageService: TokenStorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
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
    }
    this.getQuizById();
    this.getAllQuestions();

    // Lắng nghe mọi thay đổi trong FormGroup
    this.selectedQues.valueChanges.subscribe(() => {
      this.isUpdating = true;
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
  startTimer(minutes: number) {
    this.timeLeft = minutes * 60; // phút -> giây
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
    // TODO: gọi hàm submit tự động nếu muốn
  }

  // Lấy quiz
  getQuizById() {
    this.quizService.getQuizById(+this.idQuiz).subscribe((res) => {
      this.quiz = res;
      if (this.role != 'ROLE_ADMINISTRATOR' && this.quiz?.timeQuiz) {
        this.startTimer(this.quiz.timeQuiz); // Bắt đầu countdown cho học sinh
      }
    });
  }

  getAllQuestions() {
    this.questionService.getQuesOfQuiz(+this.idQuiz).subscribe((res) => {
      this.questions = res;
      if (res.length > 0) {
        this.selectQues(res[0]);
      }
    });
  }

  selectQues(ques: Question, index?: number) {
    this.currentQuestionId = ques.id || null;
    this.currentQuestionIndex = index !== undefined ? index : 0;
    this.selectedQues.patchValue(ques);
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

    dialogRef.afterClosed().subscribe((result: Question | undefined) => {
      if (result) {
        result.quizId = +this.idQuiz;

        this.questionService.create(result).subscribe({
          next: (newQuestion) => {
            this.questions.push(newQuestion as Question);

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
    });
  }

  isQuestionSelected(ques: Question): boolean {
    return this.currentQuestionId === ques.id;
  }
}
