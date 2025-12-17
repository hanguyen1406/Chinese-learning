import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../service/course/course.service';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCourseComponent } from './add-course/add-course.component';
import { Course } from '../../model/course';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';

@Component({
  selector: 'app-courses-management',
  templateUrl: './courses-management.component.html',
  styleUrls: ['./courses-management.component.css'],
})
export class CoursesManagementComponent implements OnInit {
  constructor(
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private dialog: MatDialog,
    private courseSvc: CourseService,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService
  ) {}

  courses: any[] = [];
  role: string = '';
  ngOnInit() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR'))
      this.role = 'ROLE_ADMINISTRATOR';
    this.getAllCourses();
  }

  ngAfterViewInit(): void {}
  getAllCourses() {
    this.courseSvc.getAllCourses().subscribe((courses: any) => {
      this.courses = courses;
    });
  }
  openCreate() {
    const ref = this.dialog.open(AddCourseComponent, {
      width: '640px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((data?: Course) => {
      if (!data) return; // user bấm Hủy
      this.courseSvc.createCourse(data).subscribe({
        next: () => {
          this.getAllCourses();
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
    });
  }
  getImageUrl(img: any) {
    return img || 'assets/course.jpg';
  }
  openEdit(course: Course) {
    const ref = this.dialog.open(AddCourseComponent, {
      width: '640px',
      disableClose: true,
      data: course,
    });

    ref.afterClosed().subscribe((data?: Course) => {
      if (!data) return;
      this.courseSvc.createCourse(data).subscribe({
        next: () => {
          this.getAllCourses();
          this.ngxNotificationMsgService.open({
            status: NgxNotificationStatusMsg.SUCCESS,
            header: 'Thành công',
            messages: ['Cập nhật khóa học thành công'],
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
    });
  }
}
