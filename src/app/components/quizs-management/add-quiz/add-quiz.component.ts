import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '../../../model/quiz';
import { Course } from '../../../model/course';
import { CourseService } from '../../../service/course/course.service';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css'],
})
export class AddQuizComponent implements OnInit {
  form: FormGroup;
  courses: Course[] = [];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddQuizComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Quiz | null,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id || null],
      name: [this.data?.name || '', Validators.required],
      timeQuiz: [
        this.data?.timeQuiz || 0,
        [Validators.required, Validators.min(1)],
      ],
      courseId: [this.data?.courseId || null, Validators.required],
    });
    this.getCourses();
  }
  getCourses() {
    this.courseService.getAllCourses().subscribe((courses: any) => {
      this.courses = courses;
    });
  }
  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value: Quiz = this.form.value;
    this.dialogRef.close(value); // trả data về cho component gọi dialog
  }

  oncancel() {
    this.dialogRef.close(null);
  }

  get f() {
    return this.form.controls;
  }
}
