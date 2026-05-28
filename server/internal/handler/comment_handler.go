package handler

import (
	"strconv"

	"basetalkking/internal/middleware"
	"basetalkking/internal/model/request"
	"basetalkking/internal/model/response"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	svc *service.CommentService
}

func NewCommentHandler() *CommentHandler {
	return &CommentHandler{svc: service.NewCommentService()}
}

// GetComments GET /api/v1/posts/:id/comments
func (h *CommentHandler) GetComments(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的帖子ID")
		return
	}

	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()

	comments, total, err := h.svc.GetCommentsWithReplies(uint(postID), req.Page, req.PageSize)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, comments, total, req.Page, req.PageSize)
}

// CreateComment POST /api/v1/posts/:id/comments
func (h *CommentHandler) CreateComment(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的帖子ID")
		return
	}

	var req request.CreateCommentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败："+err.Error())
		return
	}

	comment, err := h.svc.CreateComment(
		uint(postID),
		middleware.GetUserID(c),
		req.Content,
		req.ParentID,
		req.ReplyToUserID,
	)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, comment)
}

// GetReplies GET /api/v1/comments/:id/replies
func (h *CommentHandler) GetReplies(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的评论ID")
		return
	}

	var req request.PageReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}
	req.DefaultPage()
	// 子回复每页 10 条
	if req.PageSize > 10 {
		req.PageSize = 10
	}

	replies, total, err := h.svc.GetReplies(uint(commentID), req.Page, req.PageSize)
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.SuccessPage(c, replies, total, req.Page, req.PageSize)
}

// LikeComment POST /api/v1/comments/:id/like
func (h *CommentHandler) LikeComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的评论ID")
		return
	}

	liked, likeCount, err := h.svc.LikeComment(middleware.GetUserID(c), uint(commentID))
	if err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, gin.H{"liked": liked, "like_count": likeCount})
}

// PinComment PUT /api/v1/comments/:id/pin
func (h *CommentHandler) PinComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的评论ID")
		return
	}

	var req struct {
		PostID uint `json:"post_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 1000, "参数校验失败")
		return
	}

	pinned, err := h.svc.PinComment(req.PostID, uint(commentID), middleware.GetUserID(c))
	if err != nil {
		handleBizError(c, err)
		return
	}

	response.Success(c, gin.H{"is_pinned": pinned})
}

// DeleteComment DELETE /api/v1/comments/:id
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, 1000, "无效的评论ID")
		return
	}

	if err := h.svc.DeleteComment(middleware.GetUserID(c), uint(commentID), middleware.GetUserRole(c)); err != nil {
		handleBizError(c, err)
		return
	}
	response.Success(c, nil)
}
