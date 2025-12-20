export interface Comment {
  id?: number; // optional vì khi tạo mới có thể chưa có id
  contentCmt: string;
  timeCmt?: Date;
  userId?: number;
  lessonId: number;
  parentId?: number | null; // comment cha có thể null
  username?: string; // username của người comment
  replyToUserId?: number | null; // ID của người đang được reply (dùng khi reply vào reply)
  replyToUsername?: string; // username của người đang được reply (để hiển thị)
}

export interface CommentWithReplies extends Comment {
  replies: Comment[]; // danh sách reply của comment này
}
