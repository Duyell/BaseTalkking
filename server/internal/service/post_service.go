package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"basetalkking/internal/database"
	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/pkg/utils"
	"basetalkking/internal/repository"

	"gorm.io/gorm"
)

type PostService struct {
	postRepo *repository.PostRepo
}

func NewPostService() *PostService {
	return &PostService{postRepo: repository.NewPostRepo()}
}

type PostListResult struct {
	List     []model.Post `json:"list"`
	Total    int64        `json:"total"`
	Page     int          `json:"page"`
	PageSize int          `json:"page_size"`
}

func (s *PostService) CreatePost(userID uint, title, content string) (*model.Post, error) {
	title = utils.EscapeXSS(title)
	content = utils.EscapeXSS(content)

	post := &model.Post{
		UserID:  userID,
		Title:   title,
		Content: content,
	}
	if err := s.postRepo.Create(post); err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "帖子发布失败", err)
	}

	InvalidatePostCache()

	return post, nil
}

func (s *PostService) GetPostList(page, pageSize int, keyword string) (*PostListResult, error) {
	if keyword == "" && page <= 3 {
		cacheKey := fmt.Sprintf("cache:posts:list:%d:%d", page, pageSize)
		cached, err := database.RDB.Get(context.Background(), cacheKey).Result()
		if err == nil {
			var result PostListResult
			if json.Unmarshal([]byte(cached), &result) == nil {
				return &result, nil
			}
		}
	}

	posts, total, err := s.postRepo.FindList(page, pageSize, keyword)
	if err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}
	result := &PostListResult{List: posts, Total: total, Page: page, PageSize: pageSize}

	if keyword == "" {
		cacheKey := fmt.Sprintf("cache:posts:list:%d:%d", page, pageSize)
		data, _ := json.Marshal(result)
		database.RDB.Set(context.Background(), cacheKey, data, 60*time.Second)
	}

	return result, nil
}

func InvalidatePostCache() {
	ctx := context.Background()
	var cursor uint64
	for {
		keys, nextCursor, err := database.RDB.Scan(ctx, cursor, "cache:posts:list:*", 100).Result()
		if err != nil {
			return
		}
		if len(keys) > 0 {
			database.RDB.Del(ctx, keys...)
		}
		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
}

func (s *PostService) GetPostDetail(id uint) (*model.Post, error) {
	post, err := s.postRepo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return nil, e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}
	if post.Status == model.PostStatusDeleted {
		return nil, e.New(errcode.CodePostNotFound, "帖子已被删除")
	}
	return post, nil
}

func (s *PostService) UpdatePost(userID, postID uint, title, content string) error {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}

	if post.UserID != userID {
		return e.New(errcode.CodeNotPostOwner, "只能编辑自己的帖子")
	}

	post.Title = utils.EscapeXSS(title)
	post.Content = utils.EscapeXSS(content)

	if err := s.postRepo.Update(post); err != nil {
		return e.Wrap(errcode.CodeDatabaseError, "更新失败", err)
	}
	return nil
}

func (s *PostService) DeletePost(userID, postID uint, role string) error {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "查询失败", err)
	}

	if role != "admin" && post.UserID != userID {
		return e.New(errcode.CodeNotPostOwner, "只能删除自己的帖子")
	}

	if err := s.postRepo.SoftDelete(postID); err != nil {
		return e.Wrap(errcode.CodeDatabaseError, "删除失败", err)
	}
	InvalidatePostCache()
	return nil
}
