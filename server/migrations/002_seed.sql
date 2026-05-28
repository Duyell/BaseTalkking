-- ============================================================
-- 初始化数据: 角色 + 默认管理员 + 初始邀请码
-- ============================================================

SET NAMES utf8mb4;

USE `basetalkking`;

-- 系统角色
INSERT INTO `sys_role` (`role_name`, `role_key`, `description`) VALUES
  ('系统管理员', 'admin', '系统超级管理员，拥有所有权限'),
  ('普通用户',   'user',  '普通注册用户，可浏览、发帖、评论');

-- 默认管理员账号
-- 用户名: admin  /  密码: admin123
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `role`, `status`, `intro`) VALUES
  ('admin',
   '$2a$10$ZfqWOrooATu3tOFfB1EaFOpoMTC2usO5XtZztgXK4P3fpCBnxWcEi',
   '系统管理员',
   'admin',
   0,
   '系统默认管理员账号');

-- 5 个永久有效的初始邀请码（16位随机字符）
INSERT INTO `invite_code` (`code`, `status`, `create_admin_id`, `expire_time`) VALUES
  ('AbCdEfGhIjKlMnOp', 0, 1, NULL),
  ('QrStUvWxYz123456', 0, 1, NULL),
  ('BaseTalkking0001', 0, 1, NULL),
  ('Invite2026ForumZ', 0, 1, NULL),
  ('GoReactFullStack', 0, 1, NULL);
