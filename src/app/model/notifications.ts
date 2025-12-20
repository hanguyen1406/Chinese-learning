export interface Notifications {
  id?: number;
  message: string;
  type: string; // COMMENT_REPLY, COURSE_UPDATE, etc.
  time?: Date;
  idUser?: number;
  status: string; // UNREAD, READ
  relatedId?: number; // ID liên quan (lessonId, courseId, etc.)
  relatedType?: string; // Loại entity liên quan (LESSON, COURSE, etc.)
  courseId?: number; // courseId để điều hướng đến khóa học
  lessonId?: number; // lessonId để mở đúng bài học
}
