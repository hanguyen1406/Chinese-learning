// course-create-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Course } from '../../../model/course';
import { CourseService } from '../../../service/course/course.service';

@Component({
  selector: 'app-course-create',
  templateUrl: './add-course.component.html',
})
export class AddCourseComponent implements OnInit {
  form!: FormGroup;
  courses: Course[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCourseComponent>,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      numLesson: [1],
      numRating: [5],
      quizId: [null],
      thumbnailUrl: [''],
      prereqCourseId: [null],
    });

    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getAllCourses().subscribe({
      next: (data: any) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('Lỗi khi load danh sách khóa học:', err);
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
