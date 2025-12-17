import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rating } from '../../../../model/rating';

export interface RatingDialogData {
  courseId: number;
  courseName: string;
  existingRating?: Rating;
}

@Component({
  selector: 'app-rating-dialog',
  templateUrl: './rating-dialog.component.html',
  styleUrls: ['./rating-dialog.component.css'],
})
export class RatingDialogComponent implements OnInit {
  form!: FormGroup;
  selectedStar = 0;
  hoverStar = 0;
  stars = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RatingDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      content: ['', [Validators.maxLength(1000000)]],
      numStar: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    });

    // Nếu đã có đánh giá trước đó, điền vào form
    if (this.data.existingRating) {
      this.form.patchValue({
        content: this.data.existingRating.content,
        numStar: this.data.existingRating.numStar,
      });
      this.selectedStar = this.data.existingRating.numStar;
    }
  }

  selectStar(star: number): void {
    this.selectedStar = star;
    this.form.patchValue({ numStar: star });
  }

  onMouseEnter(star: number): void {
    this.hoverStar = star;
  }

  onMouseLeave(): void {
    this.hoverStar = 0;
  }

  getStarClass(star: number): string {
    const activeStar = this.hoverStar || this.selectedStar;
    return star <= activeStar ? 'star-filled' : 'star-empty';
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.valid && this.selectedStar > 0) {
      const rating: Rating = {
        ...this.data.existingRating,
        content: this.form.value.content,
        numStar: this.selectedStar,
        courseId: this.data.courseId,
      };
      this.dialogRef.close(rating);
    }
  }
}
