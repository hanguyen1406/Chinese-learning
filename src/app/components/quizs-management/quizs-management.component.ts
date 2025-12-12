import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import { AddQuizComponent } from './add-quiz/add-quiz.component';
import { Quiz } from '../../model/quiz';
import { QuizService } from '../../service/quiz/quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quizs-management',
  templateUrl: './quizs-management.component.html',
  styleUrls: ['./quizs-management.component.css'],
})
export class QuizsManagementComponent implements OnInit {
  constructor(
    private tokenStorageService: TokenStorageService,
    private dialog: MatDialog,
    private quizService: QuizService,
    private router: Router
  ) {}

  role: string = '';
  courses: any[] = []; // Dữ liệu đã phân loại theo Course
  loading: boolean = false;

  ngOnInit() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }
  }

  ngAfterViewInit() {
    this.getAllQuizs();
  }

  /**
   * Lấy tất cả quiz và phân loại theo course
   */
  getAllQuizs() {
    this.loading = true;

    this.quizService.getAllQuiz().subscribe({
      next: (res: Quiz[]) => {
        // map theo courseName
        const map: { [key: string]: Quiz[] } = {};

        res.forEach((q) => {
          if (!map[q.courseName]) {
            map[q.courseName] = [];
          }
          map[q.courseName].push(q);
        });

        // Convert sang array để dùng trong *ngFor
        this.courses = Object.keys(map).map((course) => ({
          name: course,
          quizList: map[course],
        }));

        this.loading = false;
      },

      error: () => {
        this.loading = false;
      },
    });
  }
  scrollLeft(courseName: string) {
    const el = document.getElementById('scroll-' + courseName);
    if (el) el.scrollLeft -= 300; // tốc độ cuộn
  }
  updateRequired(quiz: any) {
    const payload = { required: quiz.required };

    // this.quizService.updateQuiz(quiz.id, payload).subscribe({
    //   next: () => {
    //     console.log('✔ Đã cập nhật trạng thái bắt buộc:', payload);
    //   },
    //   error: (err) => {
    //     console.error('❌ Lỗi cập nhật quiz:', err);
    //   },
    // });
  }

  scrollRight(courseName: string) {
    const el = document.getElementById('scroll-' + courseName);
    if (el) el.scrollLeft += 300;
  }

  /**
   * Mở dialog tạo quiz mới
   */
  openCreate() {
    const dialogRef = this.dialog.open(AddQuizComponent, {
      width: '400px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.quizService.createQuiz(result).subscribe(() => {
          this.getAllQuizs();
        });
      }
    });
  }

  doQuiz(quizId: number) {
    this.router.navigate(['/quizs', quizId]);
  }

  onDelete(quiz: Quiz) {
    if (confirm(`Bạn muốn xoá bài kiểm tra "${quiz.name}" ?`)) {
      // this.quizService.deleteQuiz(quiz.id).subscribe(() => {
      //   this.getAllQuizs();
      // });
    }
  }
}
