package model

import "time"

// Role 系统角色
type Role struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	RoleName    string    `gorm:"size:50;not null" json:"role_name"`
	RoleKey     string    `gorm:"size:50;uniqueIndex;not null" json:"role_key"`
	Description string    `gorm:"size:255;default:''" json:"description"`
	CreateTime  time.Time `gorm:"autoCreateTime" json:"create_time"`
	UpdateTime  time.Time `gorm:"autoUpdateTime" json:"update_time"`
}

func (Role) TableName() string {
	return "sys_role"
}
