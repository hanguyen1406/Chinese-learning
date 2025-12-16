export interface LessonProgress {
  id?: number;
  lessonId: number;
  userId?: number;
  courseId?: number;
  watchedTime: number;
  lastAccessedAt?: Date;
}
