package repository

import (
	"basetalkking/internal/database"
	"basetalkking/internal/model"

	"gorm.io/gorm"
)

type PostRepo struct {
	db *gorm.DB
}

func NewPostRepo() *PostRepo {
	return &PostRepo{db: database.DB}
}

func (r *PostRepo) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *PostRepo) FindByID(id uint) (*model.Post, error) {
	var post model.Post
	err := r.db.Preload("Author").First(&post, id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *PostRepo) FindList(page, pageSize int, keyword string) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.Model(&model.Post{}).Where("status = ?", model.PostStatusNormal)

	if keyword != "" {
		query = query.Where("MATCH(title) AGAINST(? IN BOOLEAN MODE)", keyword)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Author").
		Order("is_top DESC, create_time DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&posts).Error

	return posts, total, err
}

func (r *PostRepo) FindByUserID(userID uint, page, pageSize int) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.Model(&model.Post{}).Where("user_id = ? AND status = ?", userID, model.PostStatusNormal)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("create_time DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&posts).Error

	return posts, total, err
}

func (r *PostRepo) Update(post *model.Post) error {
	return r.db.Model(&model.Post{}).Where("id = ?", post.ID).Updates(map[string]any{
		"title":   post.Title,
		"content": post.Content,
	}).Error
}

func (r *PostRepo) SoftDelete(id uint) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		Update("status", model.PostStatusDeleted).Error
}

func (r *PostRepo) SetTop(id uint, isTop int8) error {
	return r.db.Model(&model.Post{}).Where("id = ?", id).
		Update("is_top", isTop).Error
}

// AdminFindList 管理员查询全站帖子（含已删除）
func (r *PostRepo) AdminFindList(page, pageSize int, keyword string) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.Model(&model.Post{})
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Author").
		Order("create_time DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&posts).Error

	return posts, total, err
}
