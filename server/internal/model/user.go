package model

import "time"

// User 系统用户
type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Username   string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password   string    `gorm:"size:255;not null" json:"-"`
	Nickname   string    `gorm:"size:50;default:''" json:"nickname"`
	Avatar     string    `gorm:"size:255;default:''" json:"avatar"`
	Email      string    `gorm:"size:100;default:''" json:"email"`
	Intro      string    `gorm:"size:255;default:''" json:"intro"`
	Role       string    `gorm:"size:10;default:user;index" json:"role"`
	Status     int8      `gorm:"default:0;index" json:"status"`
	InviteCode string    `gorm:"size:32;default:''" json:"invite_code"`
	CreateTime time.Time `gorm:"autoCreateTime" json:"create_time"`
	UpdateTime time.Time `gorm:"autoUpdateTime" json:"update_time"`
}

func (User) TableName() string {
	return "sys_user"
}
