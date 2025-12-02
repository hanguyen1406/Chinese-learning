import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AddQuestionComponent } from './add-question/add-question.component';
import { MatDialog } from '@angular/material/dialog';
import { Question } from 'src/app/model/question';
import { QuestionService } from 'src/app/service/question/question.service';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';

@Component({
  selector: 'app-detail-quiz',
  templateUrl: './detail-quiz.component.html',
  styleUrls: ['./detail-quiz.component.css'],
})
export class DetailQuizComponent implements OnInit {
  idQuiz!: string;
  role: string = '';
  questions: Question[] = [];
  selectedQues?: Question;
  constructor(
    private tokenStorageService: TokenStorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private questionService: QuestionService,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService
  ) {}

  ngOnInit(): void {
    this.idQuiz = this.route.snapshot.paramMap.get('idQuiz')!;
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
      this.getAllQuestions();
    }

  }
  selectQues(ques: Question) {
  }
  getAllQuestions() {
    this.questionService
      .getQuesOfQuiz(+this.idQuiz)
      .subscribe((res) => (this.questions = res));
  }

  openCreate() {
    const dialogRef = this.dialog.open(AddQuestionComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: Question | undefined) => {
      if (result) {
        // call API backend lưu câu hỏi
        result.quizId = +this.idQuiz;
        this.questionService.create(result).subscribe({
          next: () => {
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
              messages: [err.error.message],
              direction: NgxNotificationDirection.BOTTOM_RIGHT,
            });
          },
        });
      }
    });
  }
}
