package model

import "time"

// 邀请码状态常量
const (
	InviteStatusUnused   int8 = 0 // 未使用
	InviteStatusUsed     int8 = 1 // 已使用
	InviteStatusExpired  int8 = 2 // 已过期
	InviteStatusDisabled int8 = 3 // 已禁用
)

// InviteCode 邀请码
type InviteCode struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Code          string    `gorm:"size:32;uniqueIndex;not null" json:"code"`
	Status        int8      `gorm:"default:0;index" json:"status"`
	UseUserID     *uint     `gorm:"default:null;index" json:"use_user_id"`
	CreateAdminID uint      `gorm:"not null;index" json:"create_admin_id"`
	ExpireTime    *time.Time `gorm:"default:null" json:"expire_time"`
	UseTime       *time.Time `gorm:"default:null" json:"use_time"`
	CreateTime    time.Time  `gorm:"autoCreateTime" json:"create_time"`
	UpdateTime    time.Time  `gorm:"autoUpdateTime" json:"update_time"`
}

func (InviteCode) TableName() string {
	return "invite_code"
}

// IsUsable 邀请码是否可用
func (ic *InviteCode) IsUsable() bool {
	if ic.Status != InviteStatusUnused {
		return false
	}
	if ic.ExpireTime != nil && time.Now().After(*ic.ExpireTime) {
		return false
	}
	return true
}
