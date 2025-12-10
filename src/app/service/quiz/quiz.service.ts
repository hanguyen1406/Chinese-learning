import { Injectable } from '@angular/core';
import { API_PATH } from '../../service/const';
import { Quiz } from '../../model/quiz';
import { HttpClient } from '@angular/common/http';
import { Question } from '../../model/question';
import { ScoreQuiz } from '../../model/scoreQuiz';

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
  doingQuiz(scoreQuiz: ScoreQuiz) {
    return this.http.post(`${API_URL}/doingQuiz`, scoreQuiz);
  }
  getResultQuiz(id: number) {
    return this.http.get<any>(`${API_URL}/result/${id}`);
  }
  submitQuiz(id: number) {
    return this.http.get(`${API_URL}/submitQuiz/${id}`);
  }
  checkDoing(id: number) {
    return this.http.get<any>(`${API_URL}/checkDoing/${id}`);
  }
  answerQuestion(answer: any) {
    return this.http.post(`${API_URL}/answerQuestion`, answer);
  }
  updateQuiz(quiz: Quiz) {
    return this.http.put(API_URL, quiz);
  }
  getAllQuiz() {
    return this.http.get<Quiz[]>(API_URL);
  }
}
