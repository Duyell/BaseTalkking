package service

import (
	"errors"
	"time"

	"basetalkking/internal/config"
	"basetalkking/internal/database"
	"basetalkking/internal/model"
	"basetalkking/internal/pkg/constant"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	jwtutil "basetalkking/internal/pkg/jwt"
	"basetalkking/internal/pkg/utils"
	"basetalkking/internal/repository"

	"gorm.io/gorm"
)

type AuthService struct {
	userRepo   *repository.UserRepo
	inviteRepo *repository.InviteCodeRepo
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo:   repository.NewUserRepo(),
		inviteRepo: repository.NewInviteCodeRepo(),
	}
}

// Register 邀请码注册（事务保证原子性）
func (s *AuthService) Register(username, password, inviteCodeStr string) (*model.User, error) {
	// 1. 校验用户名格式
	if !utils.ValidateUsername(username) {
		return nil, e.New(errcode.CodeUsernameInvalid, "用户名格式不正确（3-20位字母数字下划线）")
	}

	// 2. 校验密码强度
	if !utils.ValidatePassword(password) {
		return nil, e.New(errcode.CodePasswordWeak, "密码强度不足（至少8位，包含字母和数字）")
	}

	// 3. 校验用户名是否已存在
	exists, err := s.userRepo.ExistsByUsername(username)
	if err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}
	if exists {
		return nil, e.New(errcode.CodeUserExists, "用户名已存在")
	}

	// 4. 加密密码
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, e.Wrap(errcode.CodeInternalError, "密码加密失败", err)
	}

	// 5. 事务：查出邀请码并加行锁 → 校验 → 创建用户 → 标记已使用
	var user *model.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		// 5a. 查邀请码 + 行锁
		ic, err := s.inviteRepo.FindByCodeWithLock(tx, inviteCodeStr)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return e.New(errcode.CodeInviteInvalid, "邀请码不存在或已被使用")
			}
			return e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
		}

		// 5b. 校验邀请码可用性
		if !ic.IsUsable() {
			switch ic.Status {
			case model.InviteStatusUsed:
				return e.New(errcode.CodeInviteUsed, "邀请码已被使用")
			case model.InviteStatusDisabled:
				return e.New(errcode.CodeInviteDisabled, "邀请码已被禁用")
			case model.InviteStatusExpired:
				return e.New(errcode.CodeInviteExpired, "邀请码已过期")
			}
			return e.New(errcode.CodeInviteInvalid, "邀请码不可用")
		}

		// 5c. 检查是否过期（即使状态未被定时任务更新为expired）
		if ic.ExpireTime != nil && time.Now().After(*ic.ExpireTime) {
			return e.New(errcode.CodeInviteExpired, "邀请码已过期")
		}

		// 5d. 创建用户
		u := &model.User{
			Username:   username,
			Password:   hashedPassword,
			Nickname:   username,
			Role:       constant.RoleUser,
			Status:     constant.UserStatusNormal,
			InviteCode: inviteCodeStr,
		}
		if err := tx.Create(u).Error; err != nil {
			return e.Wrap(errcode.CodeDatabaseError, "用户创建失败", err)
		}

		// 5e. 标记邀请码已使用
		if err := s.inviteRepo.MarkUsed(tx, ic.ID, u.ID); err != nil {
			return e.Wrap(errcode.CodeDatabaseError, "邀请码更新失败", err)
		}

		user = u
		return nil
	})

	return user, err
}

// Login 账号密码登录
func (s *AuthService) Login(username, password string) (*model.User, string, error) {
	// 1. 查询用户
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", e.New(errcode.CodeUserNotFound, "用户不存在")
		}
		return nil, "", e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	// 2. 检查是否被封禁
	if user.Status == constant.UserStatusBanned {
		return nil, "", e.New(errcode.CodeUserBanned, "账号已被封禁，请联系管理员")
	}

	// 3. 校验密码
	if !utils.CheckPassword(password, user.Password) {
		return nil, "", e.New(errcode.CodePasswordWrong, "密码错误")
	}

	// 4. 生成 JWT Token
	cfg := config.Cfg.JWT
	token, err := jwtutil.GenerateToken(user.ID, user.Role, cfg.Secret, cfg.ExpireHours)
	if err != nil {
		return nil, "", e.Wrap(errcode.CodeInternalError, "Token生成失败", err)
	}

	return user, token, nil
}
