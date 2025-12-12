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
  role = '';
  course: any;

  lessons: Lesson[] = [];
  selectedLesson?: Lesson;

  hasLessons = false;
  indexCurrentLesson = 0;

  videoId = '';
  safeVideoUrl!: SafeResourceUrl;

  currentTime = 0;
  totalDuration = 0;
  watchedSeconds = 0;
  lastTick = 0;

  intervalWatch: any;

  showComment = false;

  @ViewChild('video') videoContainer!: ElementRef;
  @ViewChild('ytIframe') ytIframe!: ElementRef<HTMLIFrameElement>;

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
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }

    this.getDetailCourse();
    this.getLessonsOfCourse();
  }

  getDetailCourse() {
    this.courseService.getCourseById(+this.idCourse).subscribe((course) => {
      this.course = course;
    });
  }

  /** Chọn bài học */
  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
    this.indexCurrentLesson = this.lessons.indexOf(lesson);

    this.videoId = this.extractVideoId(lesson.linkVideo!);

    const origin = window.location.origin;

    const url =
      `https://www.youtube.com/embed/${this.videoId}` +
      `?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}&widgetid=1`;
    console.log('log:', url);
    
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    if (this.intervalWatch) clearInterval(this.intervalWatch);
    this.watchedSeconds = 0;

    setTimeout(() => this.initYouTubeListener(), 500);

    this.videoContainer.nativeElement.scrollTop = 0;
  }

  /** Lấy danh sách bài học */
  getLessonsOfCourse() {
    this.lessonService
      .getLessonsOfCourse(+this.idCourse)
      .subscribe((lessons: Lesson[]) => {
        this.lessons = lessons;
        if (lessons.length > 0) {
          this.hasLessons = true;
          this.selectLesson(this.lessons[0]);
        }
      });
  }

  /** Parse videoId */
  extractVideoId(link: string): string {
    const watch = link.match(/[?&]v=([^&]+)/);
    if (watch) return watch[1];

    const short = link.match(/youtu\.be\/([^?&]+)/);
    if (short) return short[1];

    return link;
  }

  /** Listener nhận thông tin từ YouTube iframe */
  initYouTubeListener() {
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!data?.info) return;

        if (data.info.currentTime !== undefined) {
          this.currentTime = data.info.currentTime;
        }

        if (data.info.duration !== undefined) {
          this.totalDuration = data.info.duration;
        }
      } catch {}
    });

    this.startWatchTimer();
  }

  /** Gửi lệnh tới iframe */
  sendCommand(func: string) {
    this.ytIframe?.nativeElement.contentWindow?.postMessage(
      JSON.stringify({
        event: 'command',
        func,
        args: [],
      }),
      '*'
    );
  }

  /** Theo dõi thời gian xem + gửi mỗi 5s */
  startWatchTimer() {
    this.intervalWatch = setInterval(() => {
      // yêu cầu cập nhật currentTime
      this.sendCommand('getCurrentTime');
      this.sendCommand('getDuration');

      this.watchedSeconds++;

      if (this.watchedSeconds % 5 === 0) {
        this.sendProgressToDB(false);
      }
    }, 1000);
  }

  sendProgressToDB(isCompleted: boolean) {
    if (!this.selectedLesson) return;

    const req = {
      lessonId: this.selectedLesson.id,
      watchedSeconds: Math.floor(this.watchedSeconds),
      currentTime: Math.floor(this.currentTime),
      totalDuration: Math.floor(this.totalDuration),
      completed: isCompleted,
    };

    console.log('Progress gửi về backend:', req);

    // this.lessonService.updateWatchProgress(req).subscribe();
  }

  openComment() {
    this.showComment = true;
  }

  closeComment() {
    this.showComment = false;
  }

  openCreate() {
    const ref = this.dialog.open(AddLessonComponent, {
      width: '640px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((data?: Lesson) => {
      if (!data) return;
      data.courseId = +this.idCourse;

      this.lessonService.createLesson(data).subscribe({
        next: () => this.getLessonsOfCourse(),
        error: (err) =>
          this.ngxNotificationMsgService.open({
            status: NgxNotificationStatusMsg.FAILURE,
            header: 'Lỗi',
            messages: [err.error.message],
            direction: NgxNotificationDirection.BOTTOM_RIGHT,
          }),
      });
    });
  }
}
