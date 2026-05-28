package model

import "time"

type PostEmbedding struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PostID     uint      `gorm:"not null;index:idx_post_id" json:"post_id"`
	ChunkIndex int       `gorm:"not null;default:0" json:"chunk_index"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	Embedding  string    `gorm:"type:json;not null" json:"embedding"`
	Model      string    `gorm:"size:50;not null;default:'text-embedding-3-small'" json:"model"`
	CreateTime time.Time `gorm:"autoCreateTime" json:"create_time"`
}

func (PostEmbedding) TableName() string { return "post_embedding" }
