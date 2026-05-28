package repository

import (
	"basetalkking/internal/database"
	"basetalkking/internal/model"

	"gorm.io/gorm"
)

type ChatRepo struct {
	db *gorm.DB
}

func NewChatRepo() *ChatRepo {
	return &ChatRepo{db: database.DB}
}

func (r *ChatRepo) FindActiveSession(userID uint) (*model.ChatSession, error) {
	var session model.ChatSession
	err := r.db.Where("user_id = ? AND status = ?", userID, model.ChatSessionActive).
		Order("create_time DESC").First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *ChatRepo) CreateSession(session *model.ChatSession) error {
	return r.db.Create(session).Error
}

func (r *ChatRepo) FindSessionByID(id uint) (*model.ChatSession, error) {
	var session model.ChatSession
	err := r.db.First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *ChatRepo) UpdateSessionTitle(id uint, title string) error {
	return r.db.Model(&model.ChatSession{}).Where("id = ?", id).
		Update("title", title).Error
}

func (r *ChatRepo) UpdateSessionSummary(id uint, summary string) error {
	return r.db.Model(&model.ChatSession{}).Where("id = ?", id).
		Update("summary", summary).Error
}

func (r *ChatRepo) SoftDeleteSession(id uint) error {
	return r.db.Model(&model.ChatSession{}).Where("id = ?", id).
		Update("status", model.ChatSessionDeleted).Error
}

func (r *ChatRepo) CreateMessage(msg *model.ChatMessage) error {
	return r.db.Create(msg).Error
}

func (r *ChatRepo) FindRecentMessages(sessionID uint, limit int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	err := r.db.Where("session_id = ? AND status = ?", sessionID, model.ChatMsgNormal).
		Order("create_time ASC").Limit(limit).Find(&messages).Error
	return messages, err
}

func (r *ChatRepo) CountMessages(sessionID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.ChatMessage{}).
		Where("session_id = ? AND status = ?", sessionID, model.ChatMsgNormal).
		Count(&count).Error
	return count, err
}
