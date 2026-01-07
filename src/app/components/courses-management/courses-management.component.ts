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
import Swal from 'sweetalert2';

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
  ) { }

  courses: any[] = [];
  role: string = '';
  ngOnInit() {
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR'))
      this.role = 'ROLE_ADMINISTRATOR';
    this.getAllCourses();
  }

  ngAfterViewInit(): void { }
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

  onDelete(course: any) {
    if (this.role !== 'ROLE_ADMINISTRATOR') return;

    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa khóa học "${course.name}"? Tất cả bài giảng và dữ liệu liên quan sẽ bị xóa vĩnh viễn!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.courseSvc.deleteCourse(course.id).subscribe({
          next: () => {
            this.getAllCourses();
            Swal.fire('Đã xóa!', 'Khóa học đã được xóa thành công.', 'success');
          },
          error: (err) => {
            Swal.fire(
              'Lỗi!',
              err?.error?.message || 'Không thể xóa khóa học.',
              'error'
            );
          },
        });
      }
    });
  }
}
