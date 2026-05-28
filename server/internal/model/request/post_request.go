package request

// CreatePostReq 发布帖子请求
type CreatePostReq struct {
	Title   string `json:"title" binding:"required,min=1,max=200"`
	Content string `json:"content" binding:"required,min=1"`
}

// UpdatePostReq 编辑帖子请求
type UpdatePostReq struct {
	Title   string `json:"title" binding:"required,min=1,max=200"`
	Content string `json:"content" binding:"required,min=1"`
}
