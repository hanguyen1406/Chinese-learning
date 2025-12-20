import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { LessonService } from '../../../../service/lesson/lesson.service';
import { Comment, CommentWithReplies } from '../../../../model/comment';
import { NotificationService } from '../../../../service/notification/notification.service';
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
export class CommentLessonComponent implements OnInit, OnChanges {
  commentText: string = '';
  replyText: string = '';
  comments: CommentWithReplies[] = [];
  @Input() lessonId: number = 0;
  @ViewChild('cmtList') cmtList!: ElementRef;

  // Để quản lý reply
  replyingToCommentId: number | null = null; // ID của comment cha (để giữ 2 cấp)
  replyingToUsername: string = '';
  replyingToUserId: number | null = null; // ID của người đang được reply (có thể là chủ reply)

  // Để quản lý hiển thị replies
  expandedCommentIds: Set<number> = new Set();

  constructor(
    private lessonService: LessonService,
    private notificationService: NotificationService,
    private readonly ngxNotificationMsgService: NgxNotificationMsgService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lessonId'] && !changes['lessonId'].firstChange) {
      this.loadComments();
    }
  }

  loadComments() {
    if (!this.lessonId) return;

    this.lessonService
      .getCommentsWithReplies(this.lessonId)
      .subscribe((data: CommentWithReplies[]) => {
        this.comments = data;
        this.scrollToTop();
      });
  }

  scrollToTop() {
    if (this.cmtList && this.cmtList.nativeElement) {
      this.cmtList.nativeElement.scrollTop = 0;
    }
  }

  /**
   * Đăng comment mới (comment cha)
   */
  postComment() {
    if (!this.commentText.trim()) return;

    const comment: Comment = {
      contentCmt: this.commentText,
      lessonId: this.lessonId,
      parentId: null,
    };

    this.lessonService.commentLesson(comment).subscribe({
      next: (res: Comment) => {
        this.commentText = '';
        // Thêm comment mới vào đầu danh sách
        const newComment: CommentWithReplies = {
          ...res,
          replies: [],
        };
        this.comments.unshift(newComment);
        this.scrollToTop();
      },
      error: (err) => {
        console.error('Error posting comment:', err);
      },
    });
  }

  /**
   * Bắt đầu reply một comment cha
   */
  startReply(comment: CommentWithReplies) {
    this.replyingToCommentId = comment.id!;
    this.replyingToUsername = comment.username || '';
    this.replyingToUserId = comment.userId || null;
    this.replyText = '';
    // Mở rộng replies của comment này
    this.expandedCommentIds.add(comment.id!);
  }

  /**
   * Bắt đầu reply một reply (vẫn giữ parentId là comment cha để hiển thị 2 cấp)
   */
  startReplyToReply(parentComment: CommentWithReplies, reply: Comment) {
    this.replyingToCommentId = parentComment.id!; // Vẫn dùng comment cha để giữ 2 cấp
    this.replyingToUsername = reply.username || '';
    this.replyingToUserId = reply.userId || null; // Nhưng gửi notification cho chủ reply
    this.replyText = '';
    this.expandedCommentIds.add(parentComment.id!);
  }

  /**
   * Hủy reply
   */
  cancelReply() {
    this.replyingToCommentId = null;
    this.replyingToUsername = '';
    this.replyingToUserId = null;
    this.replyText = '';
  }

  /**
   * Gửi reply
   */
  postReply(parentComment: CommentWithReplies) {
    if (!this.replyText.trim() || !this.replyingToCommentId) return;

    const reply: Comment = {
      contentCmt: this.replyText,
      lessonId: this.lessonId,
      parentId: this.replyingToCommentId,
      replyToUserId: this.replyingToUserId, // Gửi ID của người đang được reply
    };

    this.lessonService.commentLesson(reply).subscribe({
      next: (res: Comment) => {
        // Thêm reply vào comment cha
        parentComment.replies.push(res);
        this.cancelReply();

        // Hiển thị thông báo
        this.ngxNotificationMsgService.open({
          status: NgxNotificationStatusMsg.SUCCESS,
          header: 'Thành công',
          messages: ['Đã gửi phản hồi!'],
          direction: NgxNotificationDirection.TOP_RIGHT,
        });
      },
      error: (err) => {
        console.error('Error posting reply:', err);
      },
    });
  }

  /**
   * Toggle hiển thị replies
   */
  toggleReplies(commentId: number) {
    if (this.expandedCommentIds.has(commentId)) {
      this.expandedCommentIds.delete(commentId);
    } else {
      this.expandedCommentIds.add(commentId);
    }
  }

  /**
   * Kiểm tra xem replies có đang mở rộng không
   */
  isRepliesExpanded(commentId: number): boolean {
    return this.expandedCommentIds.has(commentId);
  }

  /**
   * Mở rộng tất cả replies (dùng khi mở từ notification)
   */
  expandAllReplies(): void {
    this.comments.forEach((comment) => {
      if (comment.id && comment.replies && comment.replies.length > 0) {
        this.expandedCommentIds.add(comment.id);
      }
    });
  }

  /**
   * Cuộn xuống cuối danh sách bình luận (bên trong container)
   */
  scrollToCommentSection(): void {
    setTimeout(() => {
      if (this.cmtList && this.cmtList.nativeElement) {
        // Cuộn bên trong container, không phải cả trang
        this.cmtList.nativeElement.scrollTop =
          this.cmtList.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
