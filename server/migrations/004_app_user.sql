-- ============================================================
-- 创建应用专用数据库用户（最小权限原则）
-- 替代 root 账号，仅授予 basetalkking 数据库的 CRUD 权限
-- ============================================================

CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_user_password_change_me';
GRANT SELECT, INSERT, UPDATE, DELETE ON `basetalkking`.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
