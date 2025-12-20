export interface QuizHistory {
  id: number;
  quizId: number;
  quizName: string;
  courseName: string;
  courseId: number;
  score: number;
  numOfQues: number;
  startedAt: Date;
  finishedAt: Date;
}
