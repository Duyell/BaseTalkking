package handler

import (
	"encoding/json"
	"fmt"
	"strconv"

	"basetalkking/internal/middleware"
	"basetalkking/internal/model/response"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/service"

	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	svc *service.AIService
}

func NewAIHandler() *AIHandler {
	return &AIHandler{svc: service.NewAIService()}
}

type chatRequest struct {
	Message string `json:"message" binding:"required"`
}

func (h *AIHandler) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, errcode.CodeParamInvalid, "参数校验失败："+err.Error())
		return
	}

	if req.Message == "" {
		response.Error(c, errcode.CodeParamInvalid, "消息不能为空")
		return
	}

	userID := middleware.GetUserID(c)

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	streamCh, sessionID, err := h.svc.ChatStream(c.Request.Context(), userID, req.Message)
	if err != nil {
		handleBizError(c, err)
		return
	}

	sendSSE(c, "meta", fmt.Sprintf(`{"session_id":%d}`, sessionID))
	c.Writer.Flush()

	for chunk := range streamCh {
		if chunk.Error != "" {
			sendSSE(c, "error", chunk.Error)
			c.Writer.Flush()
			return
		}
		if chunk.Done {
			sendSSE(c, "done", "")
			c.Writer.Flush()
			return
		}
		if chunk.Content != "" {
			sendSSE(c, "delta", chunk.Content)
			c.Writer.Flush()
		}
	}
}

func (h *AIHandler) GetSession(c *gin.Context) {
	userID := middleware.GetUserID(c)

	session, messages, remaining, err := h.svc.LoadCurrentSession(userID)
	if err != nil {
		handleBizError(c, err)
		return
	}

	response.Success(c, gin.H{
		"session":     session,
		"messages":    messages,
		"remaining":   remaining,
		"limit":       10,
		"reset_hours": 1,
	})
}

func (h *AIHandler) DeleteSession(c *gin.Context) {
	userID := middleware.GetUserID(c)

	idStr := c.Param("id")
	sessionID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Error(c, errcode.CodeParamInvalid, "无效的会话ID")
		return
	}

	if err := h.svc.DeleteSession(uint(sessionID), userID); err != nil {
		handleBizError(c, err)
		return
	}

	response.Success(c, nil)
}

func sendSSE(c *gin.Context, event, data string) {
	if data == "" {
		fmt.Fprintf(c.Writer, "event: %s\ndata: \n\n", event)
		return
	}

	if event == "delta" {
		escaped, _ := json.Marshal(data)
		fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, string(escaped))
		return
	}

	fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, data)
}
