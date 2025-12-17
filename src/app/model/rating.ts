export interface Rating {
  id?: number;
  content: string;
  numStar: number;
  timeRating?: Date;
  userId?: number;
  courseId?: number;
}
