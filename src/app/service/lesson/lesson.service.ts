import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment, CommentWithReplies } from '../../model/comment';
import { API_PATH } from '../../service/const';
import { LessonProgress } from '../../model/lessonProgress';
import { Observable } from 'rxjs';

const API_URL = `${API_PATH}/lesson`;

// Header để skip loading spinner
const SKIP_LOADING_HEADERS = new HttpHeaders().set('X-Skip-Loading', 'true');

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  constructor(private http: HttpClient) {}

  createLesson(lesson: any) {
    return this.http.post(API_URL, lesson);
  }
  commentLesson(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${API_URL}/comment`, comment);
  }
  getAllComment(lessonId: number) {
    return this.http.get(`${API_URL}/comments/${lessonId}`);
  }

  /**
   * Lấy comments với cấu trúc 2 cấp (parent và replies)
   */
  getCommentsWithReplies(lessonId: number): Observable<CommentWithReplies[]> {
    return this.http.get<CommentWithReplies[]>(
      `${API_URL}/comments-with-replies/${lessonId}`
    );
  }

  getLessonsOfCourse(courseId: number) {
    return this.http.get(`${API_URL}/lessonOfCourse/${courseId}`);
  }

  // Lưu tiến độ xem video (không hiện loading vì gọi liên tục)
  saveProgress(progress: LessonProgress): Observable<LessonProgress> {
    return this.http.post<LessonProgress>(`${API_URL}/progress`, progress, {
      headers: SKIP_LOADING_HEADERS,
    });
  }

  // Lấy tiến độ xem video của user cho 1 lesson
  getProgress(lessonId: number): Observable<LessonProgress> {
    return this.http.get<LessonProgress>(`${API_URL}/progress/${lessonId}`);
  }

  // Lấy tất cả tiến độ xem của user cho 1 khóa học
  getProgressByCourse(courseId: number): Observable<LessonProgress[]> {
    return this.http.get<LessonProgress[]>(
      `${API_URL}/progress/course/${courseId}`
    );
  }
}
