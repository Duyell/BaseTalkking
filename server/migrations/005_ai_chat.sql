-- 005_ai_chat: AI 聊天功能表
-- Phase 1: chat_session + chat_message
-- Phase 2 (预建): post_embedding

CREATE TABLE IF NOT EXISTS `chat_session` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '会话主键ID',
  `user_id`     BIGINT       NOT NULL                 COMMENT '所属用户ID',
  `title`       VARCHAR(200) NOT NULL DEFAULT ''      COMMENT '会话标题',
  `summary`     VARCHAR(1000) NOT NULL DEFAULT ''     COMMENT '上下文压缩摘要',
  `model`       VARCHAR(50)  NOT NULL DEFAULT 'deepseek-v4-flash' COMMENT '使用的模型',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '0-活跃 1-已删除',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status_time` (`user_id`, `status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_message` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT  COMMENT '消息主键ID',
  `session_id`  BIGINT   NOT NULL                 COMMENT '所属会话ID',
  `role`        VARCHAR(20)  NOT NULL             COMMENT 'user / assistant / system',
  `content`     TEXT     NOT NULL                 COMMENT '消息内容',
  `token_count` INT      NOT NULL DEFAULT 0       COMMENT 'token 用量估算',
  `status`      TINYINT  NOT NULL DEFAULT 0       COMMENT '0-正常 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_time` (`session_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `post_embedding` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
  `post_id`     BIGINT   NOT NULL                 COMMENT '关联帖子ID',
  `chunk_index` INT      NOT NULL DEFAULT 0       COMMENT '分段索引（长文分段）',
  `content`     TEXT     NOT NULL                 COMMENT '分段文本内容',
  `embedding`   JSON     NOT NULL                 COMMENT '向量数组 [0.123, -0.456, ...]',
  `model`       VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-small' COMMENT '嵌入模型',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
