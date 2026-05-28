package request

// CreateCommentReq 发表评论请求
type CreateCommentReq struct {
	Content       string `json:"content" binding:"required,min=1"`
	ParentID      *uint  `json:"parent_id"`       // 二级回复时使用，指向顶级评论 ID
	ReplyToUserID *uint  `json:"reply_to_user_id"` // 被回复用户的 ID
}
