import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-lesson',
  templateUrl: './add-lesson.component.html',
  styleUrls: ['./add-lesson.component.css'],
})
export class AddLessonComponent implements OnInit, OnDestroy {
  lessonForm: FormGroup;
  isLoadingDuration = false;
  private linkSubscription?: Subscription;
  private YT: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLessonComponent>
  ) {
    this.lessonForm = this.fb.group({
      nameLesson: ['', [Validators.required]],
      contentLesson: [''],
      linkVideo: [
        '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
      ],
      courseId: [null],
      position: [null],
      timeLesson: [null],
    });
  }

  get f() {
    return this.lessonForm.controls;
  }

  ngOnInit(): void {
    // Load YouTube API
    this.loadYouTubeAPI();

    // Lắng nghe thay đổi của linkVideo
    this.linkSubscription = this.lessonForm
      .get('linkVideo')
      ?.valueChanges.pipe(
        debounceTime(500), // Chờ 500ms sau khi ngừng gõ
        distinctUntilChanged()
      )
      .subscribe((link) => {
        if (link && this.isValidYouTubeUrl(link)) {
          this.fetchVideoDuration(link);
        }
      });
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
  ngOnDestroy(): void {
    this.linkSubscription?.unsubscribe();
  }

  loadYouTubeAPI() {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        this.YT = (window as any).YT;
      };
    } else {
      this.YT = (window as any).YT;
    }
  }

  isValidYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  extractVideoId(url: string): string | null {
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];

    return null;
  }

  fetchVideoDuration(link: string) {
    const videoId = this.extractVideoId(link);
    if (!videoId) return;

    this.isLoadingDuration = true;

    // Tạo iframe ẩn để lấy duration
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-yt-player';
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    const checkYT = setInterval(() => {
      if (this.YT && this.YT.Player) {
        clearInterval(checkYT);

        const player = new this.YT.Player('temp-yt-player', {
          videoId: videoId,
          events: {
            onReady: (event: any) => {
              const duration = event.target.getDuration();
              this.lessonForm.patchValue({ timeLesson: Math.floor(duration) });
              this.isLoadingDuration = false;

              // Cleanup
              player.destroy();
              tempDiv.remove();
            },
            onError: () => {
              this.isLoadingDuration = false;
              tempDiv.remove();
            },
          },
        });
      }
    }, 100);

    // Timeout sau 5s
    setTimeout(() => {
      clearInterval(checkYT);
      this.isLoadingDuration = false;
      if (document.getElementById('temp-yt-player')) {
        tempDiv.remove();
      }
    }, 5000);
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.lessonForm.value);
  }
}
