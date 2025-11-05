// course-create-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseCreateDto } from '../../../model/course';

@Component({
  selector: 'app-course-create',
  templateUrl: './add-course.component.html',
})
export class AddCourseComponent {
  form = this.fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    numLesson: [1],
    numRating: [5],
    quizId: [null],
    thumbnailUrl: [''],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCourseComponent>
  ) {}
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
