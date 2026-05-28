package model

import "time"

const (
	ChatMsgNormal  int8 = 0
	ChatMsgDeleted int8 = 1
)

const (
	ChatRoleUser      = "user"
	ChatRoleAssistant = "assistant"
	ChatRoleSystem    = "system"
)

type ChatMessage struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SessionID  uint      `gorm:"not null;index:idx_session_time,priority:1" json:"session_id"`
	Role       string    `gorm:"size:20;not null" json:"role"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	TokenCount int       `gorm:"not null;default:0" json:"token_count"`
	Status     int8      `gorm:"not null;default:0" json:"status"`
	CreateTime time.Time `gorm:"autoCreateTime;index:idx_session_time,priority:2" json:"create_time"`
}

func (ChatMessage) TableName() string { return "chat_message" }
