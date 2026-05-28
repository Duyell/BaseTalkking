package request

// UpdateProfileReq 修改个人信息请求
type UpdateProfileReq struct {
	Nickname string `json:"nickname" binding:"max=50"`
	Avatar   string `json:"avatar" binding:"max=255"`
	Intro    string `json:"intro" binding:"max=255"`
}
