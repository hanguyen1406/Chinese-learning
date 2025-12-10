export interface ScoreQuiz {
  id: number | null;   // Long có thể null     
  quizId: number | null; // Long có thể null
  userId: number | null; // Long có thể null
  score: number | null;         // double -> number
  started_at: Date | null;       // Date
  finished_at: Date | null;      // Date
}
