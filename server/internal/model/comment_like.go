package model

import "time"

type CommentLike struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	CommentID  uint      `gorm:"not null;uniqueIndex:uk_comment_user" json:"comment_id"`
	UserID     uint      `gorm:"not null;uniqueIndex:uk_comment_user" json:"user_id"`
	CreateTime time.Time `gorm:"autoCreateTime" json:"create_time"`
}

func (CommentLike) TableName() string {
	return "comment_like"
}
