package handler

import (
	"errors"

	"basetalkking/internal/config"
	"basetalkking/internal/middleware"
	"basetalkking/internal/model/request"
	"basetalkking/internal/model/response"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{svc: service.NewAuthService()}
}

// Register POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req request.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errcode.CodeParamInvalid, "参数校验失败："+err.Error())
		return
	}

	user, err := h.svc.Register(req.Username, req.Password, req.InviteCode)
	if err != nil {
		handleBizError(c, err)
		return
	}

	response.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"nickname": user.Nickname,
	})
}

// Login POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req request.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errcode.CodeParamInvalid, "参数校验失败："+err.Error())
		return
	}

	user, token, err := h.svc.Login(req.Username, req.Password)
	if err != nil {
		handleBizError(c, err)
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"role":     user.Role,
		},
	})
}

// Logout POST /api/v1/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	tokenString, _ := c.Get("tokenString")
	if ts, ok := tokenString.(string); ok {
		middleware.BlacklistToken(ts, config.Cfg.JWT.Secret)
	}
	response.Success(c, nil)
}

// handleBizError 统一处理业务错误
func handleBizError(c *gin.Context, err error) {
	var bizErr *e.BizError
	if errors.As(err, &bizErr) {
		response.Error(c, bizErr.Code, bizErr.Message)
		return
	}
	response.Error(c, errcode.CodeInternalError, "服务器内部错误")
}
