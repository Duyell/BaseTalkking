package service

import (
	"time"

	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/pkg/utils"
	"basetalkking/internal/repository"
)

type InviteService struct {
	inviteRepo *repository.InviteCodeRepo
}

func NewInviteService() *InviteService {
	return &InviteService{inviteRepo: repository.NewInviteCodeRepo()}
}

// GenerateCodes 批量生成邀请码
func (s *InviteService) GenerateCodes(adminID uint, count int, expireDays int) ([]model.InviteCode, error) {
	codes := make([]model.InviteCode, count)
	for i := range codes {
		code, err := utils.GenerateInviteCode(16)
		if err != nil {
			return nil, e.Wrap(errcode.CodeInternalError, "邀请码生成失败", err)
		}
		codes[i] = model.InviteCode{
			Code:          code,
			Status:        model.InviteStatusUnused,
			CreateAdminID: adminID,
		}
		if expireDays > 0 {
			t := time.Now().Add(time.Duration(expireDays) * 24 * time.Hour)
			codes[i].ExpireTime = &t
		}
	}

	if err := s.inviteRepo.BatchCreate(codes); err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "批量创建邀请码失败", err)
	}
	return codes, nil
}

// ListInvites 分页查询邀请码列表
func (s *InviteService) ListInvites(page, pageSize int, status *int8) ([]model.InviteCode, int64, error) {
	return s.inviteRepo.List(page, pageSize, status)
}

// UpdateInviteStatus 更新邀请码状态
func (s *InviteService) UpdateInviteStatus(codeID uint, status int8) error {
	if status < 0 || status > 3 {
		return e.New(errcode.CodeParamInvalid, "无效状态值")
	}
	return s.inviteRepo.UpdateStatus(codeID, status)
}
