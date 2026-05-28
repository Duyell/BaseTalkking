-- ============================================================
-- 创建评论点赞表
-- ============================================================
SET NAMES utf8mb4;

USE `basetalkking`;

DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
  `comment_id`  BIGINT   NOT NULL                 COMMENT '评论ID',
  `user_id`     BIGINT   NOT NULL                 COMMENT '点赞用户ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comment_user` (`comment_id`, `user_id`),
  KEY `idx_comment_id` (`comment_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';
