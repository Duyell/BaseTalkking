package model

import "time"

// 帖子状态常量
const (
	PostStatusNormal  int8 = 0
	PostStatusDeleted int8 = 1
)

// Post 论坛帖子
type Post struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	Title      string    `gorm:"size:200;not null" json:"title"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	IsTop      int8      `gorm:"default:0" json:"is_top"`
	Status     int8      `gorm:"default:0;index" json:"status"`
	CreateTime time.Time `gorm:"autoCreateTime" json:"create_time"`
	UpdateTime time.Time `gorm:"autoUpdateTime" json:"update_time"`

	// 关联查询
	Author *User `gorm:"foreignKey:UserID" json:"author,omitempty"`
}

func (Post) TableName() string {
	return "forum_post"
}
