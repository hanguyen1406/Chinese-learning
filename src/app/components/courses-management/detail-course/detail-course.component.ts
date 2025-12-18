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
import { LessonProgress } from '../../../model/lessonProgress';
import { RatingService } from '../../../service/rating/rating.service';
import { RatingDialogComponent } from './rating-dialog/rating-dialog.component';
import { Rating } from '../../../model/rating';

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

  // Progress tracking
  savedProgress?: LessonProgress;
  shouldSeekToSavedTime = false;
  progressMap: Map<number, LessonProgress> = new Map();

  // Rating
  userRating?: Rating;
  averageRating: number = 0;

  @ViewChild('video') videoContainer!: ElementRef;
  @ViewChild('ytIframe') ytIframe!: ElementRef<HTMLIFrameElement>;
  @ViewChild('lessonList') lessonList!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    private courseService: CourseService,
    private lessonService: LessonService,
    private dialog: MatDialog,
    private ngxNotificationMsgService: NgxNotificationMsgService,
    private sanitizer: DomSanitizer,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    this.idCourse = this.route.snapshot.paramMap.get('idCourse')!;

    const user = this.tokenStorageService.getUser() ?? { roles: [] };
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      this.role = 'ROLE_ADMINISTRATOR';
    }

    this.getDetailCourse();
    this.getLessonsOfCourse();

    // Load rating
    this.loadUserRating();
    this.loadAverageRating();

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
        // console.log('YouTube API ready');
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

    // Pause video hiện tại nếu đang phát
    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.log('Pause error:', e);
      }
    }

    this.selectedLesson = lesson;
    this.indexCurrentLesson = this.lessons.indexOf(lesson);

    const newVideoId = this.extractVideoId(lesson.linkVideo!);

    // Reset các giá trị tracking
    this.watchedSeconds = 0;
    this.currentTime = 0;
    this.totalDuration = 0;

    // Kiểm tra xem có progress đã lưu không
    this.savedProgress = this.progressMap.get(lesson.id!);
    // console.log('Progress cho lesson', lesson.id, ':', this.savedProgress);
    if (this.savedProgress && this.savedProgress.watchedTime > 0) {
      this.shouldSeekToSavedTime = true;
      // console.log('Sẽ seek đến:', this.savedProgress.watchedTime, 'giây');
    } else {
      this.shouldSeekToSavedTime = false;
    }

    // Nếu player đã tồn tại và video đã được load trước đó, dùng cueVideoById (không tự động phát)
    if (this.player && this.player.cueVideoById && this.videoId) {
      this.videoId = newVideoId;
      this.player.cueVideoById(newVideoId); // Dùng cueVideoById thay vì loadVideoById
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
      // Cuộn video container lên đầu
      this.videoContainer.nativeElement.scrollTop = 0;
    }

    // Cuộn đến lesson đang được chọn trong danh sách (chỉ cuộn trong container lesson)
    setTimeout(() => {
      const lessonElement = document.getElementById('lesson-' + lesson.id);
      if (lessonElement && this.lessonList && this.lessonList.nativeElement) {
        const container = this.lessonList.nativeElement;
        const lessonTop = lessonElement.offsetTop - container.offsetTop;
        const containerHeight = container.clientHeight;
        const lessonHeight = lessonElement.clientHeight;

        // Cuộn để lesson nằm ở giữa container
        container.scrollTo({
          top: lessonTop - containerHeight / 2 + lessonHeight / 2,
          behavior: 'smooth',
        });
      }
    }, 100);
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
      // console.log('Video đang phát');
      // tạm dừng video

      // Cập nhật lại totalDuration khi video mới bắt đầu phát
      if (this.player && this.player.getDuration) {
        this.totalDuration = this.player.getDuration();
      }

      // Seek đến thời gian đã lưu (chỉ thực hiện 1 lần khi video mới bắt đầu)
      if (
        this.shouldSeekToSavedTime &&
        this.savedProgress &&
        this.player &&
        this.player.seekTo
      ) {
        const seekTime = this.savedProgress.watchedTime;
        // console.log('Đang seek đến:', seekTime, 'giây');
        this.player.seekTo(seekTime, true);
        this.currentTime = seekTime;
        this.shouldSeekToSavedTime = false; // Chỉ seek 1 lần
      }

      this.startTimeTracking();
    } else if (state === this.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      // console.log('Video tạm dừng');
      this.stopAllIntervals();

      // Lưu progress khi tạm dừng
      this.sendProgressToDB();
    } else if (state === this.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      // console.log('Video kết thúc');
      this.stopAllIntervals();
      this.sendProgressToDB(); // Đánh dấu hoàn thành
    } else if (state === this.YT.PlayerState.CUED) {
      // Video đã được load xong (khi dùng loadVideoById)
      // console.log('Video đã sẵn sàng');
      if (this.player && this.player.getDuration) {
        this.totalDuration = this.player.getDuration();
      }
    }
  }

  onPlayerError(event: any) {
    console.error('YouTube Player Error:', event.data);
  }
  formatSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  /** Bắt đầu theo dõi thời gian */
  startTimeTracking() {
    this.stopAllIntervals();

    // Cập nhật thời gian hiển thị mỗi 1 giây
    this.intervalWatch = setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        try {
          this.currentTime = this.player.getCurrentTime();
          this.watchedSeconds++;
        } catch (error) {
          console.error('Lỗi khi lấy thời gian:', error);
        }
      }
    }, 1000);

    // Gửi tiến độ lên server mỗi 10 giây
    this.progressInterval = setInterval(() => {
      if (this.isPlaying) {
        this.sendProgressToDB();
      }
    }, 10000);
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
  sendProgressToDB() {
    if (!this.selectedLesson || !this.player) return;

    const progress: LessonProgress = {
      lessonId: this.selectedLesson.id!,
      watchedTime: Math.floor(this.currentTime),
      courseId: +this.idCourse,
    };

    // console.log('Progress gửi về backend:', progress);

    this.lessonService.saveProgress(progress).subscribe({
      next: (response) => {
        // console.log('Progress saved:', response);
        // Cập nhật progressMap
        this.progressMap.set(progress.lessonId, response);
      },
      error: (err) => console.error('Error saving progress:', err),
    });
  }

  /** Lấy danh sách bài học */
  getLessonsOfCourse() {
    this.lessonService.getLessonsOfCourse(+this.idCourse).subscribe({
      next: (lessons: any) => {
        this.lessons = lessons;
        if (lessons.length > 0) {
          this.hasLessons = true;

          // Load progress trước, sau đó mới select lesson
          this.loadAllProgress((lastViewedLessonId?: number) => {
            // Nếu có lesson đã xem gần nhất, select lesson đó
            if (lastViewedLessonId) {
              const lastLesson = this.lessons.find(
                (l) => l.id === lastViewedLessonId
              );
              if (lastLesson) {
                this.selectLesson(lastLesson);
                return;
              }
            }
            // Nếu không có progress hoặc không tìm thấy lesson, select lesson đầu tiên
            this.selectLesson(this.lessons[0]);
          });
        }
      },
      error: (err) => {
        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.FAILURE,
          header: 'Lỗi',
          messages: [err.error.message],
          direction: NgxNotificationDirection.BOTTOM_RIGHT,
          delay: 5000,
        });
      },
    });
  }

  /** Load tất cả progress của user cho khóa học này */
  loadAllProgress(callback?: (lastViewedLessonId?: number) => void) {
    this.lessonService.getProgressByCourse(+this.idCourse).subscribe({
      next: (progressList) => {
        this.progressMap.clear();
        progressList.forEach((p) => {
          this.progressMap.set(p.lessonId, p);
        });
        // console.log('Loaded progress:', this.progressMap);

        // Progress đã được sắp xếp giảm dần theo lastAccessedAt
        // Phần tử đầu tiên là lesson mới nhất user vừa xem
        const lastViewedLessonId =
          progressList.length > 0 ? progressList[0].lessonId : undefined;
        if (callback) callback(lastViewedLessonId);
      },
      error: (err) => {
        // console.log('Chưa có progress hoặc lỗi:', err);
        if (callback) callback();
      },
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

  // ========== RATING FUNCTIONS ==========

  /** Load đánh giá của user hiện tại */
  loadUserRating(): void {
    if (this.role !== 'ROLE_ADMINISTRATOR') {
      this.ratingService
        .getRatingByUserAndCourse(Number(this.idCourse))
        .subscribe({
          next: (rating) => {
            this.userRating = rating;
          },
          error: () => {
            this.userRating = undefined;
          },
        });
    }
  }

  /** Load điểm trung bình */
  loadAverageRating(): void {
    this.ratingService.getAverageRating(Number(this.idCourse)).subscribe({
      next: (avg) => {
        this.averageRating = avg || 0;
      },
      error: () => {
        this.averageRating = 0;
      },
    });
  }

  /** Mở dialog đánh giá */
  openRatingDialog(): void {
    const dialogRef = this.dialog.open(RatingDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        courseId: Number(this.idCourse),
        courseName: this.course?.name,
        existingRating: this.userRating,
      },
    });

    dialogRef.afterClosed().subscribe((result: Rating) => {
      if (result) {
        this.ratingService.saveRating(result).subscribe({
          next: (savedRating) => {
            this.userRating = savedRating;
            this.loadAverageRating();
            this.ngxNotificationMsgService.open({
              status: NgxNotificationStatusMsg.SUCCESS,
              header: 'Thành công',
              messages: [
                this.userRating
                  ? 'Cập nhật đánh giá thành công!'
                  : 'Gửi đánh giá thành công!',
              ],
              direction: NgxNotificationDirection.BOTTOM_RIGHT,
            });
          },
          error: (err) => {
            this.ngxNotificationMsgService.open({
              status: NgxNotificationStatusMsg.FAILURE,
              header: 'Lỗi',
              messages: [err.error?.message || 'Không thể gửi đánh giá'],
              direction: NgxNotificationDirection.BOTTOM_RIGHT,
            });
          },
        });
      }
    });
  }

  ngOnDestroy() {
    this.stopAllIntervals();

    // Hủy player khi component bị destroy
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
  }
}
