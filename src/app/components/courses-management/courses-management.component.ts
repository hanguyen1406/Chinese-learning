import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../model/role';
import { RoleService } from '../../service/role/role.service';
import { CourseService } from '../../service/course/course.service';
import { TokenStorageService } from '../../service/token-storage/token-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCourseComponent } from './add-course/add-course.component';
import { CourseCreateDto } from 'src/app/model/course';
import { NgxNotificationDirection, NgxNotificationMsgService, NgxNotificationStatusMsg } from 'ngx-notification-msg';

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
  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();

    if (user.roles.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }
  }
  ngAfterViewInit(): void {
    this.getAllCourses();
  }
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

    ref.afterClosed().subscribe((data?: CourseCreateDto) => {
      if (!data) return; // user bấm Hủy
      this.courseSvc.createCourse(data).subscribe({
        next: () => {
          this.getAllCourses();
        },
        error: (err) => {
          this.ngxNotificationMsgService.open({
            status: NgxNotificationStatusMsg.FAILURE,
            header: 'Thêm mới khóa học',
            messages: [err.error.message],
            direction: NgxNotificationDirection.BOTTOM_RIGHT
          });
        },
      });
    });
  }
  getImageUrl(img: any) {
    return img || 'assets/course.jpg';
  }

}
