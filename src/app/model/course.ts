export interface Course {
  id: number;
  name: string;
  description?: string | null;
  numLesson?: number | null;
  numRating?: number | null;
  quizId?: number | null;
  thumbnailUrl?: string | null;
  prereqCourseId?: number | null;
}
