import type { User } from './user';

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  is_top: number;
  status: number;
  create_time: string;
  update_time: string;
  author?: User;
}

export interface PostListParams {
  page: number;
  page_size: number;
  keyword?: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
}

export interface UpdatePostDTO {
  title: string;
  content: string;
}
