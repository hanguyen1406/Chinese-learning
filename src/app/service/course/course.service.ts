import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API_URL = 'http://localhost:8080/api/course/';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getAllCourses() {
    return this.http.get(API_URL);
  }

  getCourseById(id: number) {
    return this.http.get(`${API_URL}${id}`);
  }

  createCourse(course: any) {
    return this.http.post(API_URL, course);
  }

  updateCourse(course: any) {
    return this.http.put(API_URL, course);
  }

  deleteCourse(id: number) {
    return this.http.delete(`${API_URL}${id}`);
  }
}
