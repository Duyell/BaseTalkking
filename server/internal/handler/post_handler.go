package handler

import (
	"strconv"

	"basetalkking/internal/middleware"
	"basetalkking/internal/model/request"
	"basetalkking/internal/model/response"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	svc *service.PostService
}

func NewPostHandler() *PostHandler {
	return &PostHandler{svc: service.NewPostService()}
}

// ListPosts GET /api/v1/posts
func (h *PostHandler) ListPosts(c *gin.Context) {
	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()

	result, err := h.svc.GetPostList(req.Page, req.PageSize, req.Keyword)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, result.List, result.Total, result.Page, result.PageSize)
}

// GetPost GET /api/v1/posts/:id
func (h *PostHandler) GetPost(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的帖子ID")
		return
	}

	post, err := h.svc.GetPostDetail(uint(id))
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, post)
}

// CreatePost POST /api/v1/posts
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req request.CreatePostReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败："+err.Error())
		return
	}

	userID := middleware.GetUserID(c)
	post, err := h.svc.CreatePost(userID, req.Title, req.Content)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, post)
}

// UpdatePost PUT /api/v1/posts/:id
func (h *PostHandler) UpdatePost(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的帖子ID")
		return
	}

	var req request.UpdatePostReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败："+err.Error())
		return
	}

	if err := h.svc.UpdatePost(middleware.GetUserID(c), uint(id), req.Title, req.Content); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}

// DeletePost DELETE /api/v1/posts/:id
func (h *PostHandler) DeletePost(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的帖子ID")
		return
	}

	if err := h.svc.DeletePost(middleware.GetUserID(c), uint(id), middleware.GetUserRole(c)); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}
