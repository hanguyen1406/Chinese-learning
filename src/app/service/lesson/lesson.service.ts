import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment } from '../../model/comment';

const API_URL = 'http://localhost:8080/api/lesson';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  constructor(private http: HttpClient) { }

  createLesson(lesson: any) {
    return this.http.post(API_URL, lesson);
  }
  commentLesson(comment: Comment) {
    return this.http.post(`${API_URL}/comment`, comment);
  }
  getAllComment(lessonId: number) {
    return this.http.get(`${API_URL}/comments/${lessonId}`);
  }
  getLessonsOfCourse(courseId: number) {
    return this.http.get(`${API_URL}/lessonOfCourse/${courseId}`);
  }
}
