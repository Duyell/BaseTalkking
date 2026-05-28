package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"basetalkking/internal/config"
	"basetalkking/internal/llm"
	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/repository"

	openai "github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

const (
	maxHistoryMessages = 20
	compressThreshold  = 16
)

type AIService struct {
	chatRepo *repository.ChatRepo
	llm      *llm.Client
}

func NewAIService() *AIService {
	return &AIService{
		chatRepo: repository.NewChatRepo(),
		llm:      llm.NewClient(config.Cfg.OpenAI),
	}
}

func (s *AIService) GetOrCreateSession(userID uint) (*model.ChatSession, error) {
	session, err := s.chatRepo.FindActiveSession(userID)
	if err == nil {
		return session, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询会话失败", err)
	}

	session = &model.ChatSession{
		UserID: userID,
		Title:  "新对话",
		Model:  config.Cfg.OpenAI.Model,
	}
	if err := s.chatRepo.CreateSession(session); err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "创建会话失败", err)
	}
	return session, nil
}

func (s *AIService) LoadCurrentSession(userID uint) (*model.ChatSession, []model.ChatMessage, int64, error) {
	session, err := s.GetOrCreateSession(userID)
	if err != nil {
		return nil, nil, 0, err
	}

	messages, err := s.chatRepo.FindRecentMessages(session.ID, maxHistoryMessages)
	if err != nil {
		return nil, nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询消息失败", err)
	}

	remaining := s.getRemainingQuota(userID)
	return session, messages, int64(remaining), nil
}

func (s *AIService) GetSession(sessionID, userID uint) (*model.ChatSession, []model.ChatMessage, int64, error) {
	session, err := s.chatRepo.FindSessionByID(sessionID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil, 0, e.New(errcode.CodeAISessionNotFound, "会话不存在")
		}
		return nil, nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询会话失败", err)
	}
	if session.UserID != userID {
		return nil, nil, 0, e.New(errcode.CodeAINotOwner, "无权访问该会话")
	}

	messages, err := s.chatRepo.FindRecentMessages(sessionID, maxHistoryMessages)
	if err != nil {
		return nil, nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询消息失败", err)
	}

	remaining := s.getRemainingQuota(userID)
	return session, messages, int64(remaining), nil
}

func (s *AIService) ChatStream(ctx context.Context, userID uint, message string) (<-chan llm.StreamChunk, uint, error) {
	session, err := s.GetOrCreateSession(userID)
	if err != nil {
		return nil, 0, err
	}

	userMsg := &model.ChatMessage{
		SessionID: session.ID,
		Role:      model.ChatRoleUser,
		Content:   message,
	}
	if err := s.chatRepo.CreateMessage(userMsg); err != nil {
		return nil, 0, e.Wrap(errcode.CodeDatabaseError, "保存消息失败", err)
	}

	if session.Title == "新对话" {
		title := truncateRunes(message, 10)
		s.chatRepo.UpdateSessionTitle(session.ID, title)
	}

	historyMessages, err := s.chatRepo.FindRecentMessages(session.ID, maxHistoryMessages)
	if err != nil {
		return nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询历史消息失败", err)
	}

	msgCount, _ := s.chatRepo.CountMessages(session.ID)

	openaiMessages := s.buildMessages(session, historyMessages, msgCount)

	timeout := time.Duration(config.Cfg.OpenAI.Timeout) * time.Second
	ctx, cancel := context.WithTimeout(ctx, timeout)

	streamCh := s.llm.ChatCompleteStream(ctx, openaiMessages)

	out := make(chan llm.StreamChunk)

	go func() {
		defer close(out)
		defer cancel()

		var fullContent strings.Builder

		for chunk := range streamCh {
			if chunk.Error != "" {
				out <- chunk
				return
			}
			if chunk.Content != "" {
				fullContent.WriteString(chunk.Content)
				out <- chunk
			}
		}

		assistantMsg := &model.ChatMessage{
			SessionID: session.ID,
			Role:      model.ChatRoleAssistant,
			Content:   fullContent.String(),
		}
		s.chatRepo.CreateMessage(assistantMsg)

		if msgCount >= compressThreshold {
			s.compressContext(session, historyMessages)
		}

		out <- llm.StreamChunk{Done: true}
	}()

	return out, session.ID, nil
}

func (s *AIService) DeleteSession(sessionID, userID uint) error {
	session, err := s.chatRepo.FindSessionByID(sessionID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return e.New(errcode.CodeAISessionNotFound, "会话不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "查询会话失败", err)
	}
	if session.UserID != userID {
		return e.New(errcode.CodeAINotOwner, "无权操作该会话")
	}

	return s.chatRepo.SoftDeleteSession(sessionID)
}

func (s *AIService) buildMessages(session *model.ChatSession, history []model.ChatMessage, msgCount int64) []openai.ChatCompletionMessage {
	messages := []openai.ChatCompletionMessage{
		{Role: model.ChatRoleSystem, Content: "你是 BaseTalkking 论坛的 AI 助手。你友好、专业，帮助用户解答问题、讨论话题。请用中文回复。"},
	}

	if session.Summary != "" {
		messages[0].Content += fmt.Sprintf("\n\n之前的对话摘要: %s", session.Summary)
	}

	for _, msg := range history {
		messages = append(messages, openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	return messages
}

func (s *AIService) compressContext(session *model.ChatSession, history []model.ChatMessage) {
	if len(history) <= compressThreshold {
		return
	}

	olderMsgs := history[:len(history)-6]
	var sb strings.Builder
	for _, msg := range olderMsgs {
		sb.WriteString(fmt.Sprintf("[%s]: %s\n", msg.Role, msg.Content))
	}

	summaryPrompt := []openai.ChatCompletionMessage{
		{Role: model.ChatRoleSystem, Content: "请用不超过200字总结以下对话的关键内容，保留重要的上下文信息。"},
		{Role: model.ChatRoleUser, Content: sb.String()},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	streamCh := s.llm.ChatCompleteStream(ctx, summaryPrompt)
	var result strings.Builder
	for chunk := range streamCh {
		if chunk.Error != "" || chunk.Done {
			break
		}
		result.WriteString(chunk.Content)
	}

	if summary := strings.TrimSpace(result.String()); summary != "" {
		s.chatRepo.UpdateSessionSummary(session.ID, summary)
	}
}

func (s *AIService) getRemainingQuota(userID uint) int {
	return 10
}

func truncateRunes(s string, maxLen int) string {
	runes := []rune(s)
	if len(runes) <= maxLen {
		return s
	}
	return string(runes[:maxLen])
}
