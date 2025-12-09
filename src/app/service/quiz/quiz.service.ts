import { Injectable } from '@angular/core';
import { API_PATH } from '../../service/const';
import { Quiz } from '../../model/quiz';
import { HttpClient } from '@angular/common/http';
import { Question } from '../../model/question';

const API_URL = `${API_PATH}/quiz`;
@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(private http: HttpClient) {}

  createQuiz(quiz: Quiz) {
    return this.http.post(API_URL, quiz);
  }
  getQuizById(id: number) {
    return this.http.get<Quiz>(`${API_URL}/${id}`);
  }
  checkDoing(id: number) {
    return this.http.get<Question[]>(`${API_URL}/checkDoing/${id}`);
  }
  updateQuiz(quiz: Quiz) {
    return this.http.put(API_URL, quiz);
  }
  getAllQuiz() {
    return this.http.get<Quiz[]>(API_URL);
  }
}
