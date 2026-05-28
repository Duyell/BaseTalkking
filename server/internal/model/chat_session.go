package model

import "time"

const (
	ChatSessionActive  int8 = 0
	ChatSessionDeleted int8 = 1
)

type ChatSession struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index:idx_user_status_time,priority:1" json:"user_id"`
	Title      string    `gorm:"size:200;not null;default:''" json:"title"`
	Summary    string    `gorm:"size:1000;not null;default:''" json:"summary"`
	Model      string    `gorm:"size:50;not null;default:'deepseek-v4-flash'" json:"model"`
	Status     int8      `gorm:"not null;default:0;index:idx_user_status_time,priority:2" json:"status"`
	CreateTime time.Time `gorm:"autoCreateTime;index:idx_user_status_time,priority:3" json:"create_time"`
	UpdateTime time.Time `gorm:"autoUpdateTime" json:"update_time"`
}

func (ChatSession) TableName() string { return "chat_session" }
