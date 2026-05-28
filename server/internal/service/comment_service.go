package service

import (
	"errors"

	"basetalkking/internal/model"
	"basetalkking/internal/pkg/e"
	"basetalkking/internal/pkg/errcode"
	"basetalkking/internal/pkg/utils"
	"basetalkking/internal/repository"

	"gorm.io/gorm"
)

type CommentService struct {
	commentRepo *repository.CommentRepo
	postRepo    *repository.PostRepo
}

func NewCommentService() *CommentService {
	return &CommentService{
		commentRepo: repository.NewCommentRepo(),
		postRepo:    repository.NewPostRepo(),
	}
}

type CommentWithReplies struct {
	model.Comment
	HasMoreReplies bool           `json:"has_more_replies"`
	Replies        []ReplyItemDTO `json:"replies"`
}

type ReplyItemDTO struct {
	ID             uint   `json:"id"`
	Content        string `json:"content"`
	UserID         uint   `json:"user_id"`
	Nickname       string `json:"nickname"`
	Avatar         string `json:"avatar"`
	ReplyToUserID  *uint  `json:"reply_to_user_id"`
	ReplyToName    string `json:"reply_to_name"`
	LikeCount      int    `json:"like_count"`
	CreateTime      string `json:"create_time"`
}

// CreateComment 发表评论（顶级评论或二级回复）
func (s *CommentService) CreateComment(postID, userID uint, content string, parentID *uint, replyToUserID *uint) (*model.Comment, error) {
	// 校验帖子存在
	_, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return nil, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	// 如果是二级回复，校验 parent 存在且为顶级评论
	if parentID != nil {
		parent, err := s.commentRepo.FindByID(*parentID)
		if err != nil {
			return nil, e.New(errcode.CodeCommentNotFound, "回复的评论不存在")
		}
		if !parent.IsTopLevel() {
			return nil, e.New(1000, "仅支持两级评论，不能回复二级回复")
		}
		if parent.Status != model.CommentStatusNormal {
			return nil, e.New(errcode.CodeCommentNotFound, "回复的评论已被删除")
		}
	}

	comment := &model.Comment{
		PostID:        postID,
		ParentID:      parentID,
		ReplyToUserID: replyToUserID,
		UserID:        userID,
		Content:       utils.EscapeXSS(content),
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, e.Wrap(errcode.CodeDatabaseError, "评论失败", err)
	}

	// 如果是二级回复，增加父评论的回复计数
	if parentID != nil {
		_ = s.commentRepo.IncrementReplyCount(*parentID)
	}

	// 预加载 User 信息
	loaded, _ := s.commentRepo.FindByID(comment.ID)
	return loaded, nil
}

// GetCommentsWithReplies 获取帖子评论列表（顶级评论 + 每条附带的 top 3 热门回复）
func (s *CommentService) GetCommentsWithReplies(postID uint, page, pageSize int) ([]CommentWithReplies, int64, error) {
	// 1. 查顶级评论
	topComments, total, err := s.commentRepo.FindTopLevelByPost(postID, page, pageSize)
	if err != nil {
		return nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询评论失败", err)
	}

	if len(topComments) == 0 {
		return []CommentWithReplies{}, total, nil
	}

	// 2. 收集顶级评论 ID
	ids := make([]uint, len(topComments))
	for i, c := range topComments {
		ids[i] = c.ID
	}

	// 3. 查询每条顶级评论的热门回复 (top 3)
	hotResults, err := s.commentRepo.FindHotReplies(ids, 3)
	if err != nil {
		return nil, 0, e.Wrap(errcode.CodeDatabaseError, "查询回复失败", err)
	}

	// 4. 将热门回复按 parent_id 分组
	repliesMap := make(map[uint][]ReplyItemDTO)
	for _, hr := range hotResults {
		replyToName := ""
		if hr.ReplyToNickname != "" {
			replyToName = hr.ReplyToNickname
		}
		dto := ReplyItemDTO{
			ID:            hr.ID,
			Content:       hr.Content,
			UserID:        hr.UserID,
			Nickname:      hr.User.Nickname,
			Avatar:        hr.User.Avatar,
			ReplyToUserID: hr.ReplyToUserID,
			ReplyToName:   replyToName,
			LikeCount:     hr.LikeCount,
			CreateTime:     hr.CreateTime.Format("2006-01-02 15:04:05"),
		}
		repliesMap[*hr.ParentID] = append(repliesMap[*hr.ParentID], dto)
	}

	// 5. 组装结果
	var result []CommentWithReplies
	for _, tc := range topComments {
		replies := repliesMap[tc.ID]
		if replies == nil {
			replies = []ReplyItemDTO{}
		}
		result = append(result, CommentWithReplies{
			Comment:        tc,
			HasMoreReplies: tc.ReplyCount > 3,
			Replies:        replies,
		})
	}

	return result, total, nil
}

// GetReplies 分页获取全部子回复
func (s *CommentService) GetReplies(parentID uint, page, pageSize int) ([]model.Comment, int64, error) {
	return s.commentRepo.FindAllReplies(parentID, page, pageSize)
}

// LikeComment 点赞/取消点赞切换，返回是否已点赞和最新点赞数
func (s *CommentService) LikeComment(userID, commentID uint) (bool, int, error) {
	comment, err := s.commentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, 0, e.New(errcode.CodeCommentNotFound, "评论不存在")
		}
		return false, 0, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	if comment.UserID == userID {
		return false, 0, e.New(errcode.CodeSelfLike, "不能给自己的评论点赞")
	}

	liked, err := s.commentRepo.ExistsLike(commentID, userID)
	if err != nil {
		return false, 0, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	if liked {
		if err := s.commentRepo.DeleteLike(commentID, userID); err != nil {
			return false, 0, e.Wrap(errcode.CodeDatabaseError, "取消点赞失败", err)
		}
		return false, comment.LikeCount - 1, nil
	}

	if err := s.commentRepo.CreateLike(commentID, userID); err != nil {
		return false, 0, e.Wrap(errcode.CodeDatabaseError, "点赞失败", err)
	}
	return true, comment.LikeCount + 1, nil
}

// PinComment 置顶/取消置顶评论（仅帖主可操作）
func (s *CommentService) PinComment(postID, commentID, userID uint) (int8, error) {
	post, err := s.postRepo.FindByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, e.New(errcode.CodePostNotFound, "帖子不存在")
		}
		return 0, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	if post.UserID != userID {
		return 0, e.New(errcode.CodeForbidden, "只有帖主才能置顶评论")
	}

	comment, err := s.commentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, e.New(errcode.CodeCommentNotFound, "评论不存在")
		}
		return 0, e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	if comment.PostID != postID {
		return 0, e.New(errcode.CodeCommentNotFound, "评论不属于该帖子")
	}

	if !comment.IsTopLevel() {
		return 0, e.New(errcode.CodeParamInvalid, "只能置顶顶级评论")
	}

	pinned := int8(1)
	if comment.IsPinned == 1 {
		pinned = 0
	}

	if err := s.commentRepo.SetPinned(commentID, pinned); err != nil {
		return 0, e.Wrap(errcode.CodeDatabaseError, "操作失败", err)
	}

	return pinned, nil
}

// DeleteComment 软删除评论
func (s *CommentService) DeleteComment(userID, commentID uint, role string) error {
	comment, err := s.commentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return e.New(errcode.CodeCommentNotFound, "评论不存在")
		}
		return e.Wrap(errcode.CodeDatabaseError, "数据库错误", err)
	}

	if role != "admin" && comment.UserID != userID {
		return e.New(errcode.CodeNotCommentOwner, "只能删除自己的评论")
	}

	return s.commentRepo.SoftDelete(commentID)
}
