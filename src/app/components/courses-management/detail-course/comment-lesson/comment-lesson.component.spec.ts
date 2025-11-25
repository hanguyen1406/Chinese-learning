import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentLessonComponent } from './comment-lesson.component';

describe('CommentLessonComponent', () => {
  let component: CommentLessonComponent;
  let fixture: ComponentFixture<CommentLessonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentLessonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
