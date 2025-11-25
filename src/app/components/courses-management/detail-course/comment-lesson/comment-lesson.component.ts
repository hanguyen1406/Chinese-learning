import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LessonService } from '../../../../service/lesson/lesson.service';
import { Comment } from '../../../../model/comment';
import {
  NgxNotificationDirection,
  NgxNotificationMsgService,
  NgxNotificationStatusMsg,
} from 'ngx-notification-msg';

@Component({
  selector: 'app-comment-lesson',
  templateUrl: './comment-lesson.component.html',
  styleUrls: ['./comment-lesson.component.css'],
})
export class CommentLessonComponent implements OnInit {
  commentText: string = '';
  comments: Comment[] = [];
  @Input() lessonId: number = 0;
  @ViewChild('cmtList') cmtList!: ElementRef;
  constructor(
    private lessonService: LessonService,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }
  loadComments() {
    this.lessonService.getAllComment(this.lessonId).subscribe((data: any) => {
      this.comments = data;
      this.scrollToTop();
    });
  }
  scrollToTop() {
    this.cmtList.nativeElement.scrollTop = 0;
  }
  postComment() {
    if (!this.commentText.trim()) return;

    const comment: Comment = {
      contentCmt: this.commentText,
      lessonId: this.lessonId,
    };
    this.lessonService.commentLesson(comment).subscribe({
      next: (res: any) => {
        this.commentText = '';
        this.comments.unshift(res);
        this.scrollToTop();
      },
      error: (err) => {},
    });
  }
}
