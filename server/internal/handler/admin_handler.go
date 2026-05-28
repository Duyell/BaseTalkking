package handler

import (
	"strconv"

	"basetalkking/internal/middleware"
	"basetalkking/internal/model/request"
	"basetalkking/internal/model/response"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	inviteSvc *service.InviteService
	adminSvc  *service.AdminService
}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		inviteSvc: service.NewInviteService(),
		adminSvc:  service.NewAdminService(),
	}
}

// ListInvites GET /api/v1/admin/invites
func (h *AdminHandler) ListInvites(c *gin.Context) {
	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()

	codes, total, err := h.inviteSvc.ListInvites(req.Page, req.PageSize, nil)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, codes, total, req.Page, req.PageSize)
}

// GenerateInvites POST /api/v1/admin/invites
func (h *AdminHandler) GenerateInvites(c *gin.Context) {
	var req request.GenerateInviteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}

	codes, err := h.inviteSvc.GenerateCodes(middleware.GetUserID(c), req.Count, req.ExpireDays)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, codes)
}

// UpdateInviteStatus PUT /api/v1/admin/invites/:id/status
func (h *AdminHandler) UpdateInviteStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		Status int8 `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	if err := h.inviteSvc.UpdateInviteStatus(uint(id), body.Status); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}

// ListUsers GET /api/v1/admin/users
func (h *AdminHandler) ListUsers(c *gin.Context) {
	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()

	users, total, err := h.adminSvc.UserList(req.Page, req.PageSize, req.Keyword)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, users, total, req.Page, req.PageSize)
}

// BanUser PUT /api/v1/admin/users/:id/ban
func (h *AdminHandler) BanUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var body struct {
		Ban bool `json:"ban"`
	}
	_ = c.ShouldBindJSON(&body)

	var err error
	if body.Ban {
		err = h.adminSvc.BanUser(uint(id))
	} else {
		err = h.adminSvc.UnbanUser(uint(id))
	}
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}

// AdminListPosts GET /api/v1/admin/posts
func (h *AdminHandler) AdminListPosts(c *gin.Context) {
	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()

	result, err := h.adminSvc.AdminPostList(req.Page, req.PageSize, req.Keyword)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, result.List, result.Total, result.Page, result.PageSize)
}

// AdminDeletePost DELETE /api/v1/admin/posts/:id
func (h *AdminHandler) AdminDeletePost(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.adminSvc.AdminDeletePost(uint(id)); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}

// TopPost PUT /api/v1/admin/posts/:id/top
func (h *AdminHandler) TopPost(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		IsTop bool `json:"is_top"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	if err := h.adminSvc.TopPost(uint(id), body.IsTop); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}
