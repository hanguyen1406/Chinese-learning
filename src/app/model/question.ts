export interface Question {
  id?: number;
  content: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  quizId: number;
  image_url?: string;
}
