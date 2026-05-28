package handler

import (
	"basetalkking/internal/middleware"
	"basetalkking/internal/model/request"
	"basetalkking/internal/model/response"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc *service.UserService
}

func NewUserHandler() *UserHandler {
	return &UserHandler{svc: service.NewUserService()}
}

// GetProfile GET /api/v1/user/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	result, err := h.svc.GetProfile(middleware.GetUserID(c))
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, result)
}

// UpdateProfile PUT /api/v1/user/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req request.UpdateProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}

	if err := h.svc.UpdateProfile(middleware.GetUserID(c), req.Nickname, req.Avatar, req.Intro); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}
