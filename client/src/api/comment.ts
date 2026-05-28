import client from './client';
import type { Comment, CreateCommentDTO } from '../types/comment';
import type { PaginatedData } from '../types/common';

export const getComments = (postId: number, page = 1, pageSize = 20): Promise<PaginatedData<Comment>> => {
  return client.get(`/posts/${postId}/comments`, { params: { page, page_size: pageSize } });
};

export const getReplies = (commentId: number, page = 1, pageSize = 10): Promise<PaginatedData<Comment>> => {
  return client.get(`/comments/${commentId}/replies`, { params: { page, page_size: pageSize } });
};

export const createComment = (postId: number, data: CreateCommentDTO): Promise<Comment> => {
  return client.post(`/posts/${postId}/comments`, data);
};

export const likeComment = (commentId: number): Promise<{ liked: boolean; like_count: number }> => {
  return client.post(`/comments/${commentId}/like`);
};

export const pinComment = (commentId: number, postId: number): Promise<{ is_pinned: number }> => {
  return client.put(`/comments/${commentId}/pin`, { post_id: postId });
};

export const deleteComment = (commentId: number): Promise<void> => {
  return client.delete(`/comments/${commentId}`);
};
