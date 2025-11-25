export interface Comment {
  id?: number;           // optional vì khi tạo mới có thể chưa có id
  contentCmt: string;
  timeCmt?: Date;
  userId?: number;
  lessonId: number;
  parentId?: number | null;  // comment cha có thể null
}
