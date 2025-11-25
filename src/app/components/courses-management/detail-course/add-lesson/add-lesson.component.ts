import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-lesson',
  templateUrl: './add-lesson.component.html',
  styleUrls: ['./add-lesson.component.css'],
})
export class AddLessonComponent implements OnInit {
  lessonForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLessonComponent>
  ) {
    this.lessonForm = this.fb.group({
      nameLesson: ['', [Validators.required]],
      contentLesson: [''],
      linkVideo: [
        '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
      ],
      courseId: [null],
      position: [null, [Validators.required]],
    });
  }
  get f() {
    return this.lessonForm.controls;
  }
  ngOnInit(): void {}
  close() {
    this.dialogRef.close();
  }
  onSubmit() {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.lessonForm.value);
  }
}
