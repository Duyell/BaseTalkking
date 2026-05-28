package request

// PageReq 分页请求通用参数
type PageReq struct {
	Page     int    `form:"page" json:"page" binding:"min=1"`
	PageSize int    `form:"page_size" json:"page_size" binding:"min=1,max=100"`
	Keyword  string `form:"keyword" json:"keyword"`
}

// DefaultPage 设置默认分页值
func (p *PageReq) DefaultPage() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.PageSize < 1 {
		p.PageSize = 20
	}
	if p.PageSize > 100 {
		p.PageSize = 100
	}
}
