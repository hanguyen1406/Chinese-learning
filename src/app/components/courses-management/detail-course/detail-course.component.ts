import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
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
export class DetailCourseComponent implements OnInit, OnDestroy {
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
  isPlaying = false;

  intervalWatch: any;
  progressInterval: any;
  YT: any;
  player: any;

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

    // Load YouTube IFrame API
    this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        this.YT = (window as any).YT;
        console.log('YouTube API ready');
      };
    } else {
      this.YT = (window as any).YT;
    }
  }

  getDetailCourse() {
    this.courseService.getCourseById(+this.idCourse).subscribe((course) => {
      this.course = course;
    });
  }

  /** Chọn bài học */
  selectLesson(lesson: Lesson) {
    // Dừng interval trước
    this.stopAllIntervals();

    this.selectedLesson = lesson;
    this.indexCurrentLesson = this.lessons.indexOf(lesson);

    const newVideoId = this.extractVideoId(lesson.linkVideo!);

    // Reset các giá trị tracking
    this.watchedSeconds = 0;
    this.currentTime = 0;
    this.totalDuration = 0;

    // Nếu player đã tồn tại và video đã được load trước đó, dùng loadVideoById
    if (this.player && this.player.loadVideoById && this.videoId) {
      this.videoId = newVideoId;
      this.player.loadVideoById(newVideoId);
    } else {
      // Lần đầu tiên hoặc player chưa sẵn sàng
      const origin = window.location.origin;
      const url =
        `https://www.youtube.com/embed/${newVideoId}` +
        `?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}&widgetid=1`;

      this.videoId = newVideoId;
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      // Chờ Angular render xong iframe mới rồi mới khởi tạo player
      setTimeout(() => {
        if (this.ytIframe && this.ytIframe.nativeElement) {
          this.initializePlayer();
        }
      }, 500);
    }

    if (this.videoContainer && this.videoContainer.nativeElement) {
      this.videoContainer.nativeElement.scrollTop = 0;
    }
  }

  /** Khởi tạo YouTube Player */
  initializePlayer() {
    if (!this.YT) {
      this.YT = (window as any).YT;
      if (!this.YT) {
        console.log('YouTube API chưa sẵn sàng');
        setTimeout(() => this.initializePlayer(), 500);
        return;
      }
    }

    // Kiểm tra iframe có tồn tại không
    if (!this.ytIframe || !this.ytIframe.nativeElement) {
      console.log('Iframe chưa sẵn sàng');
      setTimeout(() => this.initializePlayer(), 300);
      return;
    }

    // Tạo player mới
    try {
      this.player = new this.YT.Player(this.ytIframe.nativeElement, {
        events: {
          onReady: (event: any) => this.onPlayerReady(event),
          onStateChange: (event: any) => this.onPlayerStateChange(event),
          onError: (event: any) => this.onPlayerError(event),
        },
      });
    } catch (error) {
      console.error('Lỗi khởi tạo player:', error);
    }
  }

  /** Sự kiện khi player sẵn sàng */
  onPlayerReady(event: any) {
    console.log('YouTube Player is ready');

    // Lấy thông tin thời lượng video
    if (event.target && event.target.getDuration) {
      this.totalDuration = event.target.getDuration();
    }
  }

  /** Sự kiện khi trạng thái player thay đổi */
  onPlayerStateChange(event: any) {
    const state = event.data;

    if (state === this.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      console.log('Video đang phát');

      // Cập nhật lại totalDuration khi video mới bắt đầu phát
      if (this.player && this.player.getDuration) {
        this.totalDuration = this.player.getDuration();
      }

      this.startTimeTracking();
    } else if (state === this.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      console.log('Video tạm dừng');
      this.stopAllIntervals();
    } else if (state === this.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      console.log('Video kết thúc');
      this.stopAllIntervals();
      this.sendProgressToDB(true); // Đánh dấu hoàn thành
    } else if (state === this.YT.PlayerState.CUED) {
      // Video đã được load xong (khi dùng loadVideoById)
      console.log('Video đã sẵn sàng');
      if (this.player && this.player.getDuration) {
        this.totalDuration = this.player.getDuration();
      }
    }
  }

  onPlayerError(event: any) {
    console.error('YouTube Player Error:', event.data);
  }

  /** Bắt đầu theo dõi thời gian */
  startTimeTracking() {
    this.stopAllIntervals();

    // Cập nhật thời gian mỗi 100ms
    this.intervalWatch = setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        try {
          this.currentTime = this.player.getCurrentTime();
          this.watchedSeconds++;

          // Gửi tiến độ mỗi 5 giây
          if (this.watchedSeconds % 5 === 0) {
            this.sendProgressToDB(false);
          }
        } catch (error) {
          console.error('Lỗi khi lấy thời gian:', error);
        }
      }
    }, 100);
  }

  /** Dừng tất cả interval */
  stopAllIntervals() {
    if (this.intervalWatch) {
      clearInterval(this.intervalWatch);
      this.intervalWatch = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /** Gửi tiến độ xem về backend */
  sendProgressToDB(isCompleted: boolean) {
    if (!this.selectedLesson || !this.player) return;

    const req = {
      lessonId: this.selectedLesson.id,
      watchedSeconds: Math.floor(this.watchedSeconds),
      currentTime: Math.floor(this.currentTime),
      totalDuration: Math.floor(this.totalDuration),
      completed: isCompleted,
    };

    console.log('Progress gửi về backend:', req);

    // this.lessonService.updateWatchProgress(req).subscribe({
    //   next: (response) => console.log('Progress saved:', response),
    //   error: (err) => console.error('Error saving progress:', err)
    // });
  }

  /** Lấy danh sách bài học */
  getLessonsOfCourse() {
    this.lessonService
      .getLessonsOfCourse(+this.idCourse)
      .subscribe((lessons: any) => {
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

  /** Hàm tiện ích để kiểm tra và lấy thời gian */
  getCurrentTime(): number {
    if (this.player && this.player.getCurrentTime) {
      return Math.floor(this.player.getCurrentTime());
    }
    return 0;
  }

  /** Hàm tiện ích để phát video */
  playVideo() {
    if (this.player && this.player.playVideo) {
      this.player.playVideo();
    }
  }

  /** Hàm tiện ích để tạm dừng video */
  pauseVideo() {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo();
    }
  }

  ngOnDestroy() {
    this.stopAllIntervals();

    // Hủy player khi component bị destroy
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
  }
}
