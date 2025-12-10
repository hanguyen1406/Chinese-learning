export interface Question {
  id?: number;
  content: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer?: string;
  userAnswer?: string;
  explanation?: string;
  quizId?: number;
  image_url?: string;
}
