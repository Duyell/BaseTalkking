package repository

import (
	"basetalkking/internal/database"
	"basetalkking/internal/model"

	"gorm.io/gorm"
)

type CommentRepo struct {
	db *gorm.DB
}

func NewCommentRepo() *CommentRepo {
	return &CommentRepo{db: database.DB}
}

func (r *CommentRepo) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

func (r *CommentRepo) FindTopLevelByPost(postID uint, page, pageSize int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	query := r.db.Model(&model.Comment{}).
		Where("post_id = ? AND parent_id IS NULL AND status = ?", postID, model.CommentStatusNormal)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("User").
		Order("is_pinned DESC, create_time ASC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&comments).Error

	return comments, total, err
}

type HotReplyResult struct {
	model.Comment
	ReplyToNickname string `json:"reply_to_nickname"`
	Rn              int    `json:"-" gorm:"column:rn"`
}

func (r *CommentRepo) FindHotReplies(parentIDs []uint, limit int) ([]HotReplyResult, error) {
	if len(parentIDs) == 0 {
		return nil, nil
	}

	var results []HotReplyResult
	err := r.db.Raw(`
		SELECT * FROM (
			SELECT c.*, u.nickname, u.avatar,
				ru.nickname AS reply_to_nickname,
				ROW_NUMBER() OVER (
					PARTITION BY c.parent_id
					ORDER BY c.like_count DESC, c.create_time ASC
				) AS rn
			FROM forum_comment c
			JOIN sys_user u ON c.user_id = u.id
			LEFT JOIN sys_user ru ON c.reply_to_user_id = ru.id
			WHERE c.parent_id IN ? AND c.status = 0
		) sub WHERE rn <= ?
	`, parentIDs, limit).Scan(&results).Error

	return results, err
}

func (r *CommentRepo) FindAllReplies(parentID uint, page, pageSize int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	query := r.db.Model(&model.Comment{}).
		Where("parent_id = ? AND status = ?", parentID, model.CommentStatusNormal)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("User").
		Preload("ReplyTo").
		Order("like_count DESC, create_time ASC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&comments).Error

	return comments, total, err
}

func (r *CommentRepo) FindByID(id uint) (*model.Comment, error) {
	var comment model.Comment
	err := r.db.First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *CommentRepo) SoftDelete(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		Update("status", model.CommentStatusDeleted).Error
}

func (r *CommentRepo) SetPinned(id uint, pinned int8) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		Update("is_pinned", pinned).Error
}

func (r *CommentRepo) IncrementReplyCount(parentID uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", parentID).
		UpdateColumn("reply_count", gorm.Expr("reply_count + 1")).Error
}

func (r *CommentRepo) ExistsLike(commentID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.CommentLike{}).
		Where("comment_id = ? AND user_id = ?", commentID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *CommentRepo) CreateLike(commentID, userID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		like := &model.CommentLike{CommentID: commentID, UserID: userID}
		if err := tx.Create(like).Error; err != nil {
			return err
		}
		return tx.Model(&model.Comment{}).Where("id = ?", commentID).
			UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
	})
}

func (r *CommentRepo) DeleteLike(commentID, userID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("comment_id = ? AND user_id = ?", commentID, userID).
			Delete(&model.CommentLike{}).Error; err != nil {
			return err
		}
		return tx.Model(&model.Comment{}).Where("id = ?", commentID).
			UpdateColumn("like_count", gorm.Expr("GREATEST(like_count - 1, 0)")).Error
	})
}
