import client from './client';
import type { Post, PostListParams, CreatePostDTO, UpdatePostDTO } from '../types/post';
import type { PaginatedData } from '../types/common';

export const getPostList = (params: PostListParams): Promise<PaginatedData<Post>> => {
  return client.get('/posts', { params });
};

export const getPostDetail = (id: number): Promise<Post> => {
  return client.get(`/posts/${id}`);
};

export const createPost = (data: CreatePostDTO): Promise<Post> => {
  return client.post('/posts', data);
};

export const updatePost = (id: number, data: UpdatePostDTO): Promise<void> => {
  return client.put(`/posts/${id}`, data);
};

export const deletePost = (id: number): Promise<void> => {
  return client.delete(`/posts/${id}`);
};
