export interface AnswerQuestion {
  id: number | null;
  userId: number | null;
  quizId: number;
  questionId: number;
  userAnswer: string;  
  answeredAt: Date;
}
