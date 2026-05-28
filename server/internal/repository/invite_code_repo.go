package repository

import (
	"basetalkking/internal/database"
	"basetalkking/internal/model"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type InviteCodeRepo struct {
	db *gorm.DB
}

func NewInviteCodeRepo() *InviteCodeRepo {
	return &InviteCodeRepo{db: database.DB}
}

// FindByCodeWithLock 查找邀请码并加行锁（防止并发注册）
func (r *InviteCodeRepo) FindByCodeWithLock(tx *gorm.DB, code string) (*model.InviteCode, error) {
	var ic model.InviteCode
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("code = ?", code).
		First(&ic).Error
	if err != nil {
		return nil, err
	}
	return &ic, nil
}

// FindByCode 普通查询邀请码
func (r *InviteCodeRepo) FindByCode(code string) (*model.InviteCode, error) {
	var ic model.InviteCode
	err := r.db.Where("code = ?", code).First(&ic).Error
	if err != nil {
		return nil, err
	}
	return &ic, nil
}

// MarkUsed 标记邀请码为已使用（在事务中调用）
func (r *InviteCodeRepo) MarkUsed(tx *gorm.DB, id, userID uint) error {
	now := time.Now()
	return tx.Model(&model.InviteCode{}).Where("id = ?", id).Updates(map[string]any{
		"status":       model.InviteStatusUsed,
		"use_user_id":  userID,
		"use_time":     now,
	}).Error
}

// Create 创建邀请码
func (r *InviteCodeRepo) Create(ic *model.InviteCode) error {
	return r.db.Create(ic).Error
}

// BatchCreate 批量创建邀请码
func (r *InviteCodeRepo) BatchCreate(codes []model.InviteCode) error {
	return r.db.Create(&codes).Error
}

// List 分页查询邀请码列表
func (r *InviteCodeRepo) List(page, pageSize int, status *int8) ([]model.InviteCode, int64, error) {
	var codes []model.InviteCode
	var total int64

	query := r.db.Model(&model.InviteCode{})
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("create_time DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&codes).Error

	return codes, total, err
}

// UpdateStatus 更新邀请码状态
func (r *InviteCodeRepo) UpdateStatus(id uint, status int8) error {
	return r.db.Model(&model.InviteCode{}).Where("id = ?", id).
		Update("status", status).Error
}
