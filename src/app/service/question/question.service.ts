import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_PATH } from '../const';
import { Question } from '../../model/question';

const API_URL = `${API_PATH}/question`;
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  constructor(private http: HttpClient) {}

  create(question: Question) {
    return this.http.post(API_URL, question);
  }
  update(question: Question) {
    return this.http.put(API_URL, question);
  }
  getQuesOfQuiz( id: number) {
    return this.http.get<Question[]>(`${API_URL}/quesOfQuiz/${id}`);
  }
}
