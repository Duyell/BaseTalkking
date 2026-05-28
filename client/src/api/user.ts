import client from './client';
import type { User } from '../types/user';
import type { Post } from '../types/post';

interface ProfileResult {
  user: User;
  posts: Post[];
  post_total: number;
}

export const getProfile = (): Promise<ProfileResult> => {
  return client.get('/user/profile');
};

export const updateProfile = (data: { nickname?: string; avatar?: string; intro?: string }): Promise<void> => {
  return client.put('/user/profile', data);
};
