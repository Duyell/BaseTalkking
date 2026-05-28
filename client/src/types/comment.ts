export interface ReplyItem {
  id: number;
  content: string;
  user_id: number;
  nickname: string;
  avatar: string;
  reply_to_user_id: number | null;
  reply_to_name: string;
  like_count: number;
  create_time: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  reply_to_user_id: number | null;
  user_id: number;
  content: string;
  like_count: number;
  reply_count: number;
  status: number;
  is_pinned: number;
  create_time: string;
  user: {
    id: number;
    nickname: string;
    avatar: string;
  } | null;
  reply_to_user?: {
    id: number;
    nickname: string;
  } | null;
  has_more_replies: boolean;
  replies: ReplyItem[];
}

export interface CreateCommentDTO {
  content: string;
  parent_id?: number;
  reply_to_user_id?: number;
}
