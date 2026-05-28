-- 006_comment_pin: 评论置顶功能
ALTER TABLE `forum_comment` ADD COLUMN `is_pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '0-正常 1-置顶' AFTER `status`;
CREATE INDEX `idx_post_pinned` ON `forum_comment` (`post_id`, `is_pinned`);
