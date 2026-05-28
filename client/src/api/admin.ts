import client from './client';
import type { PaginatedData } from '../types/common';

export const getInviteList = (page: number, pageSize = 20): Promise<PaginatedData<unknown>> => {
  return client.get('/admin/invites', { params: { page, page_size: pageSize } });
};

export const generateInvites = (count: number, expireDays = 0): Promise<unknown[]> => {
  return client.post('/admin/invites', { count, expire_days: expireDays });
};

export const updateInviteStatus = (id: number, status: number): Promise<void> => {
  return client.put(`/admin/invites/${id}/status`, { status });
};

export const getUserList = (page: number, pageSize = 20, keyword = ''): Promise<PaginatedData<unknown>> => {
  return client.get('/admin/users', { params: { page, page_size: pageSize, keyword } });
};

export const banUser = (id: number, ban: boolean): Promise<void> => {
  return client.put(`/admin/users/${id}/ban`, { ban });
};

export const getAdminPostList = (page: number, pageSize = 20, keyword = ''): Promise<PaginatedData<unknown>> => {
  return client.get('/admin/posts', { params: { page, page_size: pageSize, keyword } });
};

export const adminDeletePost = (id: number): Promise<void> => {
  return client.delete(`/admin/posts/${id}`);
};

export const topPost = (id: number, isTop: boolean): Promise<void> => {
  return client.put(`/admin/posts/${id}/top`, { is_top: isTop });
};
