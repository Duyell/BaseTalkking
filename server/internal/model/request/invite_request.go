package request

// GenerateInviteReq 生成邀请码请求
type GenerateInviteReq struct {
	Count      int    `json:"count" binding:"required,min=1,max=100"`
	ExpireDays int    `json:"expire_days"` // 0 表示永久有效
}
