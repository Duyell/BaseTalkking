package service

import (
	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/pkg/utils"
	"basetalkking/internal/repository"

	"gorm.io/gorm"
)

type UserService struct {
	userRepo *repository.UserRepo
	postRepo *repository.PostRepo
}

func NewUserService() *UserService {
	return &UserService{
		userRepo: repository.NewUserRepo(),
		postRepo: repository.NewPostRepo(),
	}
}

type ProfileResult struct {
	User      model.User   `json:"user"`
	Posts     []model.Post `json:"posts"`
	PostTotal int64        `json:"post_total"`
}

// GetProfile 获取个人中心信息
func (s *UserService) GetProfile(userID uint) (*ProfileResult, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, e.New(errcode.CodeUserNotFound, "用户不存在")
		}
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}

	posts, total, err := s.postRepo.FindByUserID(userID, 1, 10)
	if err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}

	return &ProfileResult{User: *user, Posts: posts, PostTotal: total}, nil
}

// UpdateProfile 更新个人信息
func (s *UserService) UpdateProfile(userID uint, nickname, avatar, intro string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return e.New(errcode.CodeUserNotFound, "用户不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}

	if nickname != "" {
		user.Nickname = utils.EscapeXSS(nickname)
	}
	if avatar != "" {
		user.Avatar = utils.EscapeXSS(avatar)
	}
	if intro != "" {
		user.Intro = utils.EscapeXSS(intro)
	}

	return s.userRepo.Update(user)
}
