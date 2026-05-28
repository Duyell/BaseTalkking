package model

import "time"

// 评论状态常量
const (
	CommentStatusNormal  int8 = 0
	CommentStatusDeleted int8 = 1
)

// Comment 论坛评论
type Comment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	PostID         uint      `gorm:"not null;index:idx_post_parent" json:"post_id"`
	ParentID       *uint     `gorm:"default:null;index:idx_post_parent" json:"parent_id"`
	ReplyToUserID  *uint     `gorm:"default:null" json:"reply_to_user_id"`
	UserID         uint      `gorm:"not null;index" json:"user_id"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	LikeCount      int       `gorm:"default:0" json:"like_count"`
	ReplyCount     int       `gorm:"default:0" json:"reply_count"`
	Status         int8      `gorm:"default:0;index" json:"status"`
	IsPinned       int8      `gorm:"default:0" json:"is_pinned"`
	CreateTime     time.Time `gorm:"autoCreateTime" json:"create_time"`

	// 关联查询
	User      *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReplyTo   *User    `gorm:"foreignKey:ReplyToUserID" json:"reply_to_user,omitempty"`
	Replies   []Comment `gorm:"-" json:"replies,omitempty"`
}

func (Comment) TableName() string {
	return "forum_comment"
}

// IsTopLevel 是否为顶级评论
func (c *Comment) IsTopLevel() bool {
	return c.ParentID == nil
}
