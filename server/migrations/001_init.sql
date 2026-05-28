-- ============================================================
-- 数据库: basetalkking
-- 字符集: utf8mb4  |  排序规则: utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `basetalkking`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `basetalkking`;

-- ============================================================
-- 表 1: sys_role  角色表
-- ============================================================
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '角色主键ID',
  `role_name`   VARCHAR(50)  NOT NULL                 COMMENT '角色名称',
  `role_key`    VARCHAR(50)  NOT NULL                 COMMENT '角色唯一标识 (admin / user)',
  `description` VARCHAR(255) NOT NULL DEFAULT ''      COMMENT '角色描述',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统角色表';

-- ============================================================
-- 表 2: sys_user  用户表
-- ============================================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '用户主键ID',
  `username`    VARCHAR(50)  NOT NULL                 COMMENT '登录账号（唯一）',
  `password`    VARCHAR(255) NOT NULL                 COMMENT '加密密码（BCrypt）',
  `nickname`    VARCHAR(50)  NOT NULL DEFAULT ''      COMMENT '用户昵称',
  `avatar`      VARCHAR(255) NOT NULL DEFAULT ''      COMMENT '头像地址',
  `email`       VARCHAR(100) NOT NULL DEFAULT ''      COMMENT '绑定邮箱（可选）',
  `intro`       VARCHAR(255) NOT NULL DEFAULT ''      COMMENT '个人简介',
  `role`        VARCHAR(10)  NOT NULL DEFAULT 'user'  COMMENT '角色标识（admin / user）',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '账号状态：0-正常  1-封禁',
  `invite_code` VARCHAR(32)  NOT NULL DEFAULT ''      COMMENT '注册所用邀请码',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '信息更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_invite_code` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

-- ============================================================
-- 表 3: invite_code  邀请码表
-- ============================================================
DROP TABLE IF EXISTS `invite_code`;
CREATE TABLE `invite_code` (
  `id`              BIGINT      NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
  `code`            VARCHAR(32) NOT NULL                 COMMENT '邀请码唯一编码（16位随机字符）',
  `status`          TINYINT     NOT NULL DEFAULT 0       COMMENT '状态：0-未使用  1-已使用  2-已过期  3-已禁用',
  `use_user_id`     BIGINT      NULL     DEFAULT NULL    COMMENT '使用用户ID（NULL=未使用）',
  `create_admin_id` BIGINT      NOT NULL                 COMMENT '创建管理员ID',
  `expire_time`     DATETIME    NULL     DEFAULT NULL    COMMENT '过期时间（NULL=永久有效）',
  `use_time`        DATETIME    NULL     DEFAULT NULL    COMMENT '使用时间',
  `create_time`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_create_admin_id` (`create_admin_id`),
  KEY `idx_use_user_id` (`use_user_id`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请码表';

-- ============================================================
-- 表 4: forum_post  帖子表
-- ============================================================
DROP TABLE IF EXISTS `forum_post`;
CREATE TABLE `forum_post` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '帖子主键ID',
  `user_id`     BIGINT       NOT NULL                 COMMENT '发布用户ID',
  `title`       VARCHAR(200) NOT NULL                 COMMENT '帖子标题',
  `content`     TEXT         NOT NULL                 COMMENT '帖子正文内容',
  `is_top`      TINYINT      NOT NULL DEFAULT 0       COMMENT '是否置顶：0-否  1-是',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '帖子状态：0-正常  1-已删除',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top_create_time` (`is_top`, `create_time`),
  FULLTEXT KEY `ft_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛帖子表';

-- ============================================================
-- 表 5: forum_comment  评论表（支持二级回复）
-- ============================================================
DROP TABLE IF EXISTS `forum_comment`;
CREATE TABLE `forum_comment` (
  `id`                BIGINT   NOT NULL AUTO_INCREMENT  COMMENT '评论主键ID',
  `post_id`           BIGINT   NOT NULL                 COMMENT '关联帖子ID',
  `parent_id`         BIGINT   NULL     DEFAULT NULL    COMMENT '父评论ID (NULL=顶级评论)',
  `reply_to_user_id`  BIGINT   NULL     DEFAULT NULL    COMMENT '被回复的用户ID (仅二级回复有值)',
  `user_id`           BIGINT   NOT NULL                 COMMENT '评论用户ID',
  `content`           TEXT     NOT NULL                 COMMENT '评论内容（纯文本）',
  `like_count`        INT      NOT NULL DEFAULT 0       COMMENT '点赞数（二级回复热度排序依据）',
  `reply_count`       INT      NOT NULL DEFAULT 0       COMMENT '子回复总数（冗余字段）',
  `status`            TINYINT  NOT NULL DEFAULT 0       COMMENT '状态：0-正常  1-已删除',
  `create_time`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_parent` (`post_id`, `parent_id`),
  KEY `idx_parent_like` (`parent_id`, `like_count`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛评论表';
