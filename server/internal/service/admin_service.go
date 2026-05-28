package service

import (
	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/repository"

	"gorm.io/gorm"
)

type AdminService struct {
	userRepo *repository.UserRepo
	postRepo *repository.PostRepo
}

func NewAdminService() *AdminService {
	return &AdminService{
		userRepo: repository.NewUserRepo(),
		postRepo: repository.NewPostRepo(),
	}
}

// UserList 分页查询用户列表
func (s *AdminService) UserList(page, pageSize int, keyword string) ([]model.User, int64, error) {
	users, total, err := s.userRepo.List(page, pageSize, keyword)
	if err != nil {
		return []model.User{}, 0, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}
	if users == nil {
		users = []model.User{}
	}
	return users, total, nil
}

// BanUser 封禁用户
func (s *AdminService) BanUser(userID uint) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return e.New(errcode.CodeUserNotFound, "用户不存在")
	}
	user.Status = 1
	return s.userRepo.Update(user)
}

// UnbanUser 解封用户
func (s *AdminService) UnbanUser(userID uint) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return e.New(errcode.CodeUserNotFound, "用户不存在")
	}
	user.Status = 0
	return s.userRepo.Update(user)
}

// AdminPostList 管理员查询全站帖子
func (s *AdminService) AdminPostList(page, pageSize int, keyword string) (*PostListResult, error) {
	posts, total, err := s.postRepo.AdminFindList(page, pageSize, keyword)
	if err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}
	return &PostListResult{List: posts, Total: total, Page: page, PageSize: pageSize}, nil
}

// AdminDeletePost 管理员删除帖子
func (s *AdminService) AdminDeletePost(postID uint) error {
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}
	if err := s.postRepo.SoftDelete(postID); err != nil {
		return err
	}
	InvalidatePostCache()
	return nil
}

// TopPost 置顶/取消置顶
func (s *AdminService) TopPost(postID uint, isTop bool) error {
	var v int8
	if isTop {
		v = 1
	}
	if err := s.postRepo.SetTop(postID, v); err != nil {
		return err
	}
	InvalidatePostCache()
	return nil
}
