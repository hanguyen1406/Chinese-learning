import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rating } from '../../model/rating';
import { API_PATH } from '../const';

const API_URL = `${API_PATH}/rating`;
@Injectable({
  providedIn: 'root',
})
export class RatingService {
  constructor(private http: HttpClient) {}

  // Tạo hoặc cập nhật đánh giá
  saveRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(API_URL, rating);
  }

  // Lấy đánh giá của user cho khóa học
  getRatingByUserAndCourse(courseId: number): Observable<Rating> {
    return this.http.get<Rating>(`${API_URL}/my-rating/${courseId}`);
  }

  // Lấy điểm trung bình của khóa học
  getAverageRating(courseId: number): Observable<number> {
    return this.http.get<number>(`${API_URL}/course/${courseId}/average`);
  }
}
