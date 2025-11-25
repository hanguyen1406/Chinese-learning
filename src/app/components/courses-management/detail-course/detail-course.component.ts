import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TokenStorageService } from '../../../service/token-storage/token-storage.service';
import { CourseService } from '../../../service/course/course.service';
import { AddLessonComponent } from './add-lesson/add-lesson.component';
import { MatDialog } from '@angular/material/dialog';
import { LessonService } from '../../../service/lesson/lesson.service';
import { Lesson } from '../../../model/lesson';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-course',
  templateUrl: './detail-course.component.html',
  styleUrls: ['./detail-course.component.css'],
})
export class DetailCourseComponent implements OnInit {
  idCourse!: string;
  role: string = '';
  course: any;
  lessons: Lesson[] = [];
  selectedLesson?: Lesson;
  videoUrl?: SafeResourceUrl;
  hasLessons: boolean = false;
  indexCurrentLesson: number = 0;
  showComment = false;
  @ViewChild('video') videoContainer!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    private courseService: CourseService,
    private lessonService: LessonService,
    private dialog: MatDialog,
    private ngxNotificationMsgService: NgxNotificationMsgService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.idCourse = this.route.snapshot.paramMap.get('idCourse')!;
    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR'))
      this.role = 'ROLE_ADMINISTRATOR';
    this.getDetailCourse();
    this.getLessonsOfCourse();
  }
  getDetailCourse() {
    this.courseService.getCourseById(+this.idCourse).subscribe((course) => {
      this.course = course;
    });
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
    this.indexCurrentLesson = this.lessons.indexOf(lesson);
    this.videoUrl = this.getYoutubeEmbedUrl(lesson.linkVideo!);
    this.videoContainer.nativeElement.scrollTop = 0;
  }
  getLessonsOfCourse() {
    if (!this.idCourse) return;
    this.lessonService
      .getLessonsOfCourse(+this.idCourse)
      .subscribe((lessons: any) => {
        this.lessons = lessons;
        if (this.lessons.length > 0) {
          this.hasLessons = true;
          this.selectLesson(this.lessons[0]);
        }
      });
  }
  openCreate() {
    const ref = this.dialog.open(AddLessonComponent, {
      width: '640px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((data?: Lesson) => {
      if (!data) return; // user bấm Hủy
      data.courseId = +this.idCourse;
      this.lessonService.createLesson(data).subscribe({
        next: () => {
          this.getLessonsOfCourse();
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
  openComment() {
    this.showComment = true;
  }

  closeComment() {
    this.showComment = false;
  }
  private getYoutubeEmbedUrl(link: string): SafeResourceUrl | undefined {
    if (!link) return undefined;

    // xử lý vài kiểu link cơ bản:
    // https://www.youtube.com/watch?v=XXXX
    // https://youtu.be/XXXX
    let videoId = '';

    // dạng watch?v=
    const watchMatch = link.match(/[?&]v=([^&]+)/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }

    // dạng youtu.be/xxxx
    if (!videoId) {
      const shortMatch = link.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      }
    }

    // nếu link đã là id sẵn
    if (!videoId) {
      videoId = link;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
