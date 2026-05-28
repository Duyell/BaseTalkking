// 后端统一响应外层
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页数据结构
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  page_size: number;
  keyword?: string;
}
