import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import { AddQuizComponent } from './add-quiz/add-quiz.component';
import { Quiz } from '../../model/quiz';
import { QuizService } from '../../service/quiz/quiz.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-quizs-management',
  templateUrl: './quizs-management.component.html',
  styleUrls: ['./quizs-management.component.css'],
})
export class QuizsManagementComponent implements OnInit {
  constructor(
    private tokenStorageService: TokenStorageService,
    private dialog: MatDialog,
    private quizService: QuizService
  ) {}
  role: string = '';
  quizs: any[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'timeQuiz',
    'courseName',
    'numOfQues',
    'actions',
  ];

  dataSource = new MatTableDataSource<Quiz>([]);
  total = 0;
  pageSize = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR'))
      this.role = 'ROLE_ADMINISTRATOR';
  }
  ngAfterViewInit() {
    this.getAllQuizs();
  }
  getAllQuizs() {
    this.quizService.getAllQuiz().subscribe((res: any) => {
      this.dataSource.data = res;
      this.total = res.length;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  page(event: any) {
    // nếu backend phân trang thì xử lý ở đây
    console.log(event);
  }
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

  onDelete(item: any) {
    console.log('Delete:', item);
    // confirm + call API xóa
  }
}
