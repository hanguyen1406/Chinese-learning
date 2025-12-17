// course-create-dialog.component.ts
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Course } from '../../../model/course';
import { CourseService } from '../../../service/course/course.service';

@Component({
  selector: 'app-course-create',
  templateUrl: './add-course.component.html',
})
export class AddCourseComponent implements OnInit {
  form!: FormGroup;
  courses: Course[] = [];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCourseComponent>,
    private courseService: CourseService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Course | null
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

    // Load courses trước, sau đó mới patch data nếu là edit mode
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getAllCourses().subscribe({
      next: (data: any) => {
        this.courses = data;

        // Patch value SAU khi courses đã load xong
        if (this.data) {
          this.isEditMode = true;
          this.form.patchValue(this.data);
        }
      },
      error: (err) => {
        console.error('Lỗi khi load danh sách khóa học:', err);
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  compareCourseId(a: any, b: any): boolean {
    // So sánh bằng == để handle cả string và number
    return a == b;
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
