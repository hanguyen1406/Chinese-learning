import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Question } from '../../../../model/question';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddQuestionComponent>
  ) {
    this.form = this.fb.group({
      content: ['', Validators.required],
      a: ['', Validators.required],
      b: ['', Validators.required],
      c: ['', Validators.required],
      d: ['', Validators.required],
      answer: ['a', Validators.required], // mặc định A là đáp án
      explanation: [''],
      image_url: [
        '',
        [Validators.pattern(/^https?:\/\/.+/)],
      ],
    });
  }
  ngOnInit(): void {}
  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: Question = this.form.value;

    this.dialogRef.close(value); // trả dữ liệu ra cho component cha
  }
}
