# BaseTalkking 开发日志

> 完整记录从项目初始化到当前阶段 (2026-05-28) 的所有开发工作。
> 本文档 + `development-spec.md` 基础规格书 = 可在代码完全丢失后完整复现项目。

---

## 目录

1. [项目概述](#1-项目概述)
2. [基础设施](#2-基础设施)
3. [数据库完整 Schema](#3-数据库完整-schema)
4. [后端架构](#4-后端架构)
5. [前端架构](#5-前端架构)
6. [AI 智能助手 (Phase 1)](#6-ai-智能助手-phase-1)
7. [评论置顶功能](#7-评论置顶功能)
8. [自定义表情选择器](#8-自定义表情选择器)
9. [UI/UX 改进记录](#9-uiux-改进记录)
10. [Bug 修复记录](#10-bug-修复记录)
11. [配置与环境变量](#11-配置与环境变量)
12. [启动步骤](#12-启动步骤)

---

## 1. 项目概述

**BaseTalkking** — 邀请制论坛，正在向 AI 智能助手方向演进。

| 项目 | 说明 |
|------|------|
| **技术栈** | Go 1.25 (Gin) + React 19 (TypeScript) + MySQL 8.0 + Redis 7 |
| **LLM** | DeepSeek v4-flash (兼容 OpenAI API) |
| **Go workspace** | `go.work` 指向 `./server` |
| **构建工具** | Vite 6 (前端), Go modules (后端) |
| **容器化** | Docker Compose (MySQL + Redis + Backend + Nginx) |

### 项目目录结构 (完整)

```
BaseTalkking/
├── client/                              # React 19 + TypeScript + Vite 前端
│   ├── index.html                       # SPA 入口，含反闪烁脚本
│   ├── vite.config.ts                   # proxy /api → localhost:8080
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg                  # 蓝色 "B" 图标
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx                     # ReactDOM.createRoot 入口
│       ├── App.tsx                      # RouterProvider + Context Providers
│       ├── api/                         # Axios API 层
│       │   ├── client.ts               # Axios 实例，拦截器：自动 Bearer Token + 401跳转 + 解包 data
│       │   ├── auth.ts                 # login, register
│       │   ├── post.ts                 # getPostList, getPostDetail, createPost, updatePost, deletePost
│       │   ├── comment.ts              # getComments, getReplies, createComment, likeComment, pinComment, deleteComment
│       │   ├── user.ts                 # getProfile, updateProfile
│       │   ├── admin.ts                # invite CRUD, user management, post management
│       │   └── chat.ts                 # getSession, deleteSession, sendChatMessage (SSE fetch)
│       ├── components/
│       │   ├── Auth/                    # ProtectedRoute.tsx, AdminRoute.tsx
│       │   ├── Layout/                 # MainLayout.tsx, AdminLayout.tsx, Header.tsx, Sidebar.tsx
│       │   ├── Post/                   # PostCard.tsx, PostList.tsx, PostForm.tsx, PostDetail.tsx
│       │   ├── Comment/               # CommentItem.tsx, ReplyItem.tsx, ReplyBox.tsx, CommentList.tsx, CommentForm.tsx
│       │   ├── Chat/                   # ChatPanel.tsx, ChatMessageBubble.tsx
│       │   └── Common/                # Pagination.tsx, Loading.tsx, Empty.tsx, ErrorBoundary.tsx, EmojiPicker.tsx, emojiData.ts
│       ├── context/                    # AuthContext, ThemeContext, ToastContext, ConfirmContext
│       ├── pages/
│       │   ├── LoginPage.tsx, RegisterPage.tsx, HomePage.tsx
│       │   ├── PostDetailPage.tsx, PostCreatePage.tsx, PostEditPage.tsx
│       │   ├── ProfilePage.tsx, ProfileEditPage.tsx
│       │   └── Admin/ (AdminDashboard, InviteManage, UserManage, PostManage)
│       ├── router/index.tsx            # createBrowserRouter 路由定义
│       ├── styles/
│       │   ├── global.css              # 全局重置 + @import variables/animations/chat
│       │   ├── variables.css           # CSS 自定义属性，[data-theme="light"] / [data-theme="dark"]
│       │   ├── animations.css          # 按钮涟漪、登录背景、Toast 动画
│       │   └── chat.css                # ChatPanel 滑入/滑出、打字指示器、FAB 脉冲
│       ├── types/                      # common.ts, user.ts, post.ts, comment.ts, chat.ts
│       └── utils/                      # storage.ts, format.ts
│
├── server/                              # Go + Gin 后端
│   ├── cmd/basetalkking/main.go        # 入口：config.Load → DB/Redis Init → router.Setup → r.Run
│   ├── internal/
│   │   ├── config/config.go            # Viper 加载 YAML + godotenv .env + 环境变量覆盖
│   │   ├── database/
│   │   │   ├── mysql.go                # GORM MySQL 连接池
│   │   │   └── redis.go                # go-redis v9 连接
│   │   ├── model/
│   │   │   ├── user.go                 # sys_user (password json:"-")
│   │   │   ├── invite_code.go          # invite_code (IsUsable 方法)
│   │   │   ├── forum_post.go           # forum_post
│   │   │   ├── forum_comment.go        # forum_comment (IsTopLevel 方法, IsPinned 字段)
│   │   │   ├── comment_like.go         # comment_like
│   │   │   ├── sys_role.go             # sys_role
│   │   │   ├── chat_session.go         # chat_session (Phase 1)
│   │   │   ├── chat_message.go         # chat_message (Phase 1)
│   │   │   ├── post_embedding.go       # post_embedding (Phase 2 预建)
│   │   │   ├── request/                # 请求 DTO
│   │   │   └── response/response.go    # 统一响应格式
│   │   ├── repository/                 # 数据访问层 (GORM)
│   │   │   ├── user_repo.go
│   │   │   ├── invite_code_repo.go
│   │   │   ├── post_repo.go
│   │   │   ├── comment_repo.go
│   │   │   └── chat_repo.go
│   │   ├── service/                    # 业务逻辑层
│   │   │   ├── auth_service.go
│   │   │   ├── user_service.go
│   │   │   ├── post_service.go
│   │   │   ├── comment_service.go
│   │   │   ├── invite_service.go
│   │   │   ├── admin_service.go
│   │   │   └── ai_service.go
│   │   ├── handler/                    # HTTP 处理器
│   │   │   ├── auth_handler.go
│   │   │   ├── user_handler.go
│   │   │   ├── post_handler.go
│   │   │   ├── comment_handler.go
│   │   │   ├── admin_handler.go
│   │   │   └── ai_handler.go
│   │   ├── middleware/
│   │   │   ├── logger.go               # slog 结构化日志
│   │   │   ├── recovery.go             # panic recover
│   │   │   ├── cors.go                 # CORS, 允许 localhost:5173
│   │   │   ├── ratelimit.go            # 全局限流 + 登录/注册/AI 限流
│   │   │   └── auth.go                 # JWT Bearer + Redis 黑名单 + Admin()
│   │   ├── router/router.go            # 路由分组注册
│   │   ├── llm/                        # LLM 客户端 (Phase 1)
│   │   │   ├── client.go               # OpenAI 兼容客户端 (DeepSeek)
│   │   │   └── types.go                # StreamChunk
│   │   └── pkg/
│   │       ├── errcode/errcode.go      # 错误码常量
│   │       ├── jwt/jwt.go              # JWT 生成/解析
│   │       ├── e/error.go              # BizError
│   │       ├── constant/constant.go    # 角色/状态常量
│   │       └── utils/                  # password, xss, validator, invitecode
│   ├── configs/
│   │   ├── config.dev.yaml             # 开发环境
│   │   ├── config.prod.yaml            # 生产环境
│   │   └── config.example.yaml         # 配置模板
│   ├── migrations/
│   │   ├── 001_init.sql                # 5 张基础表
│   │   ├── 002_seed.sql                # 种子数据
│   │   ├── 003_comment_like.sql        # 点赞表
│   │   ├── 004_app_user.sql            # MySQL 专用用户
│   │   ├── 005_ai_chat.sql             # AI 聊天表 (Phase 1)
│   │   └── 006_comment_pin.sql         # 评论置顶 (Phase 1)
│   ├── .env                            # 敏感配置 (gitignored)
│   ├── go.mod / go.sum
│   ├── Makefile
│   └── deployments/                    # Dockerfile + nginx.conf + SSL
│
├── docker-compose.yml                  # 本地开发基础设施
├── docker-compose.prod.yml             # 生产环境全栈
├── go.work / go.work.sum               # Go workspace
├── .env.example                        # 环境变量模板
└── doc/
    ├── function.md                     # 原始功能文档
    ├── development-spec.md             # 基础规格书 (论坛核心)
    ├── Agentfunction.md                # Agent 功能概念
    ├── AI-agent-upgrade-plan.md        # AI 升级计划 (四阶段)
    └── development-log.md              # 本文档
```

---

## 2. 基础设施

### 2.1 技术栈版本

| 组件 | 版本 | 说明 |
|------|------|------|
| Go | 1.25 | 后端语言 |
| Gin | 1.10+ | HTTP 框架 |
| GORM | 1.30+ | ORM，MySQL 驱动 |
| go-redis | v9 | Redis 客户端 |
| go-openai | v1.41.2 | OpenAI 兼容 SDK (DeepSeek) |
| godotenv | v1.5.1 | .env 文件加载 |
| Viper | 最新 | YAML 配置管理 |
| React | 19 | 前端框架 |
| TypeScript | 5.8+ | 类型系统 |
| Vite | 6 | 构建工具 |
| React Router | 7 | 路由 |
| Axios | 最新 | HTTP 客户端 |
| MySQL | 8.0 | 关系型数据库 |
| Redis | 7 | 缓存 + 限流 |

### 2.2 Go Workspace

```go
// go.work
go 1.25
use ./server
```

### 2.3 前端编译约束

- `verbatimModuleSyntax: true` — type 导入必须使用 `import type`
- `erasableSyntaxOnly: true` — 禁止 `enum`，使用 `const` 或 `type` 替代

---

## 3. 数据库完整 Schema

### 3.1 所有迁移文件 (按执行顺序)

| 迁移 | 文件 | 内容 |
|------|------|------|
| 001 | `001_init.sql` | sys_role, sys_user, invite_code, forum_post, forum_comment |
| 002 | `002_seed.sql` | 角色 + admin 用户 + 5 个邀请码 |
| 003 | `003_comment_like.sql` | comment_like 点赞表 |
| 004 | `004_app_user.sql` | 创建 app_user MySQL 专用用户 (替代 root) |
| 005 | `005_ai_chat.sql` | chat_session, chat_message, post_embedding (Phase 1) |
| 006 | `006_comment_pin.sql` | forum_comment 添加 is_pinned 字段 + 索引 |

### 3.2 完整表结构

#### sys_role
```sql
CREATE TABLE `sys_role` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `role_name`   VARCHAR(50)  NOT NULL,
  `role_key`    VARCHAR(50)  NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT '',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### sys_user
```sql
CREATE TABLE `sys_user` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `username`    VARCHAR(50)  NOT NULL UNIQUE,
  `password`    VARCHAR(255) NOT NULL,           -- BCrypt hash, json:"-"
  `nickname`    VARCHAR(50)  NOT NULL DEFAULT '',
  `avatar`      VARCHAR(255) NOT NULL DEFAULT '',
  `email`       VARCHAR(100) NOT NULL DEFAULT '',
  `intro`       VARCHAR(255) NOT NULL DEFAULT '',
  `role`        VARCHAR(10)  NOT NULL DEFAULT 'user',
  `status`      TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-封禁',
  `invite_code` VARCHAR(32)  NOT NULL DEFAULT '',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`), KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`), KEY `idx_invite_code` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### invite_code
```sql
CREATE TABLE `invite_code` (
  `id`              BIGINT    NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(32)  NOT NULL UNIQUE,
  `status`          TINYINT   NOT NULL DEFAULT 0  COMMENT '0-未使用 1-已使用 2-已过期 3-已禁用',
  `use_user_id`     BIGINT    DEFAULT NULL,
  `create_admin_id` BIGINT    NOT NULL,
  `expire_time`     DATETIME  DEFAULT NULL,   -- NULL=永久有效
  `use_time`        DATETIME  DEFAULT NULL,
  `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`), KEY `idx_create_admin_id` (`create_admin_id`),
  KEY `idx_use_user_id` (`use_user_id`), KEY `idx_expire_time` (`expire_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**IsUsable() 方法**: `status == 0 AND (expire_time IS NULL OR expire_time > NOW())`

#### forum_post
```sql
CREATE TABLE `forum_post` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT    NOT NULL,
  `title`       VARCHAR(200) NOT NULL,
  `content`     TEXT      NOT NULL,
  `is_top`      TINYINT   NOT NULL DEFAULT 0,
  `status`      TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`), KEY `idx_status` (`status`),
  KEY `idx_is_top_create_time` (`is_top`, `create_time`),
  FULLTEXT KEY `ft_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

排序规则: `ORDER BY is_top DESC, create_time DESC`
搜索: `MATCH(title) AGAINST(? IN BOOLEAN MODE)`

#### forum_comment (含 Phase 1 is_pinned 字段)
```sql
CREATE TABLE `forum_comment` (
  `id`                BIGINT    NOT NULL AUTO_INCREMENT,
  `post_id`           BIGINT    NOT NULL,
  `parent_id`         BIGINT    DEFAULT NULL  COMMENT 'NULL=顶级评论',
  `reply_to_user_id`  BIGINT    DEFAULT NULL  COMMENT '被@的用户ID',
  `user_id`           BIGINT    NOT NULL,
  `content`           TEXT      NOT NULL,
  `like_count`        INT       NOT NULL DEFAULT 0,
  `reply_count`       INT       NOT NULL DEFAULT 0  COMMENT '冗余字段',
  `status`            TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-已删除',
  `is_pinned`         TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-置顶 (Phase 1 新增)',
  `create_time`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_parent` (`post_id`, `parent_id`),
  KEY `idx_parent_like` (`parent_id`, `like_count`),
  KEY `idx_user_id` (`user_id`), KEY `idx_status` (`status`),
  KEY `idx_post_pinned` (`post_id`, `is_pinned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

查询逻辑:
1. 顶级评论: `WHERE post_id=? AND parent_id IS NULL AND status=0 ORDER BY is_pinned DESC, create_time ASC`
2. 热门回复 top 3: `ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY like_count DESC, create_time ASC)`
3. 展开全部回复: `WHERE parent_id=? AND status=0 ORDER BY like_count DESC, create_time ASC`

二级限制: Service 层校验，只能回复顶级评论（parent_id 对应的评论必须 parent_id IS NULL）

#### comment_like
```sql
CREATE TABLE `comment_like` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `comment_id`  BIGINT    NOT NULL,
  `user_id`     BIGINT    NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comment_user` (`comment_id`, `user_id`),
  KEY `idx_comment_id` (`comment_id`), KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

点赞 Toggle: 事务中原子操作 INSERT+like_count+1 或 DELETE+GREATEST(like_count-1,0)。禁止自赞 (CodeSelfLike=3011)。

#### chat_session (Phase 1 新增)
```sql
CREATE TABLE `chat_session` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT       NOT NULL,
  `title`       VARCHAR(200) NOT NULL DEFAULT '',
  `summary`     VARCHAR(1000) NOT NULL DEFAULT ''   COMMENT '上下文压缩摘要',
  `model`       VARCHAR(50)  NOT NULL DEFAULT 'deepseek-v4-flash',
  `status`      TINYINT      NOT NULL DEFAULT 0     COMMENT '0-活跃 1-已删除',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status_time` (`user_id`, `status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### chat_message (Phase 1 新增)
```sql
CREATE TABLE `chat_message` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT,
  `session_id`  BIGINT   NOT NULL,
  `role`        VARCHAR(20)  NOT NULL  COMMENT 'user / assistant / system',
  `content`     TEXT     NOT NULL,
  `token_count` INT      NOT NULL DEFAULT 0,
  `status`      TINYINT  NOT NULL DEFAULT 0  COMMENT '0-正常 1-已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_time` (`session_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### post_embedding (Phase 2 预建)
```sql
CREATE TABLE `post_embedding` (
  `id`          BIGINT   NOT NULL AUTO_INCREMENT,
  `post_id`     BIGINT   NOT NULL,
  `chunk_index` INT      NOT NULL DEFAULT 0,
  `content`     TEXT     NOT NULL,
  `embedding`   JSON     NOT NULL,
  `model`       VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-small',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 种子数据

```sql
SET NAMES utf8mb4;

-- 角色
INSERT INTO `sys_role` (`role_name`, `role_key`, `description`) VALUES
  ('系统管理员', 'admin', '系统超级管理员'),
  ('普通用户',   'user',  '普通注册用户');

-- 管理员 (admin / admin123, BCrypt)
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `role`, `status`, `intro`) VALUES
  ('admin', '$2a$10$ZfqWOrooATu3tOFfB1EaFOpoMTC2usO5XtZztgXK4P3fpCBnxWcEi', '系统管理员', 'admin', 0, '系统默认管理员账号');

-- 5 个永久邀请码
INSERT INTO `invite_code` (`code`, `status`, `create_admin_id`, `expire_time`) VALUES
  ('AbCdEfGhIjKlMnOp', 0, 1, NULL), ('QrStUvWxYz123456', 0, 1, NULL),
  ('BaseTalkking0001', 0, 1, NULL), ('Invite2026ForumZ', 0, 1, NULL),
  ('GoReactFullStack', 0, 1, NULL);
```

> **注意**: SQL 文件必须以 `SET NAMES utf8mb4;` 开头，导入时需加 `--default-character-set=utf8mb4`

---

## 4. 后端架构

### 4.1 分层架构

```
Handler (参数绑定 + JSON 响应) → Service (业务逻辑 + 事务) → Repository (GORM CRUD)
```

**规则**: Handler 不操作 DB / Service 不操作 HTTP (gin.Context) / Repository 不写业务逻辑

### 4.2 中间件链

| 中间件 | 范围 | 功能 |
|--------|------|------|
| Logger | 全局 | slog: method/path/status/latency/ip |
| Recovery | 全局 | defer recover() → 500 |
| CORS | 全局 | origin: localhost:5173, credentials:true |
| RateLimit(10, 1s) | 全局 | Redis 每 IP 每秒 10 次 |
| LoginRateLimit | /auth/login | Redis 每 IP 每分钟 5 次 |
| RegisterRateLimit | /auth/register | Redis 每 IP 每分钟 3 次 |
| AIChatRateLimit | /ai/chat | Redis 每用户每小时 10 次 (Phase 1) |
| Auth | /api/v1/* | JWT Bearer + Redis 黑名单检查 |
| Admin | /api/v1/admin/* | role=="admin" |

### 4.3 完整 API 路由表

```
公开接口 (无需认证):
  POST /api/v1/auth/login              — 登录 (限流: 5/min/IP)
  POST /api/v1/auth/register           — 注册 (限流: 3/min/IP)

认证接口:
  POST /api/v1/auth/logout             — 登出 (token 加入 Redis 黑名单)
  GET  /api/v1/user/profile            — 获取个人信息
  PUT  /api/v1/user/profile            — 更新个人信息

  GET  /api/v1/posts                   — 帖子列表 (分页 + 搜索)
  GET  /api/v1/posts/:id               — 帖子详情
  POST /api/v1/posts                   — 发布帖子
  PUT  /api/v1/posts/:id               — 编辑帖子 (仅作者)
  DELETE /api/v1/posts/:id             — 删除帖子 (作者或管理员)

  GET  /api/v1/posts/:id/comments      — 评论列表 (顶级 + top3 回复)
  POST /api/v1/posts/:id/comments      — 发表评论/回复
  GET  /api/v1/comments/:id/replies    — 展开全部子回复
  POST /api/v1/comments/:id/like       — 点赞/取消点赞 (toggle)
  PUT  /api/v1/comments/:id/pin        — 置顶/取消置顶评论 (Phase 1, 仅帖主)
  DELETE /api/v1/comments/:id          — 删除评论

AI 助手 (Phase 1):
  POST /api/v1/ai/chat                 — SSE 流式对话 (限流: 10/hour/user)
  GET  /api/v1/ai/sessions             — 获取当前活跃会话 + 消息历史
  DELETE /api/v1/ai/sessions/:id       — 清除上下文 (软删除会话)

管理员接口:
  GET  /api/v1/admin/invites           — 邀请码列表
  POST /api/v1/admin/invites           — 生成邀请码
  PUT  /api/v1/admin/invites/:id/status — 更新邀请码状态
  GET  /api/v1/admin/users             — 用户列表
  PUT  /api/v1/admin/users/:id/ban     — 封禁/解封
  GET  /api/v1/admin/posts             — 全站帖子列表 (含已删除)
  DELETE /api/v1/admin/posts/:id       — 管理员删帖
  PUT  /api/v1/admin/posts/:id/top     — 置顶/取消置顶
```

### 4.4 错误码体系

| 范围 | 类别 | 常量 |
|------|------|------|
| 200 | 成功 | CodeSuccess = 200 |
| 1000-1999 | 参数校验 | CodeParamInvalid, CodeParamMissing, CodePasswordWeak, CodeUsernameInvalid |
| 2000-2999 | 认证授权 | CodeUnauthorized, CodeTokenExpired, CodeTokenInvalid, CodeForbidden, CodeUserBanned |
| 3000-3999 | 业务逻辑 | CodeUserExists, CodeUserNotFound, CodePasswordWrong, CodeInviteInvalid, CodeInviteUsed, CodeInviteExpired, CodeInviteDisabled, CodePostNotFound, CodeCommentNotFound, CodeNotPostOwner, CodeNotCommentOwner, CodeSelfLike |
| 4000-4999 | 系统错误 | CodeInternalError, CodeDatabaseError, CodeRedisError, CodeRateLimited |
| 5000-5099 | AI 专用 | CodeAIQuotaExceeded=5000, CodeAISessionNotFound=5001, CodeAINotOwner=5002, CodeAIStreamError=5003, CodeAITimeout=5004 |

统一格式: `{ "code": 200, "message": "success", "data": {...} }`
分页格式: `{ "code": 200, "data": { "list": [...], "total": N, "page": N, "page_size": N } }`

### 4.5 Redis Key 设计

| Key 格式 | 用途 | TTL |
|----------|------|-----|
| `rl:global:{ip}` | 全局限流 | 1s |
| `rl:login:{ip}` | 登录限流 | 60s |
| `rl:register:{ip}` | 注册限流 | 60s |
| `rl:ai:{userID}` | AI 调用限流 | 3600s (1h) |
| `jwt:bl:{sha256(token)}` | JWT 黑名单 | Token 剩余有效期 |
| `cache:posts:list:{page}:{size}` | 帖子列表缓存 | 60s |

**限流实现 (固定窗口)**:
```go
func checkRate(key string, limit int, window time.Duration) bool {
    count, _ := database.RDB.Incr(ctx, key).Result()
    if count == 1 { database.RDB.Expire(ctx, key, window) }
    return count <= int64(limit)
}
// Redis 不可用时放行，避免误伤
```

**缓存失效**: 使用 Redis SCAN 删除所有 `cache:posts:list:*` (DEL 不支持 glob 通配符)

### 4.6 JWT 机制

```go
// 生成: HS256, 默认 7 天
func GenerateToken(userID uint, role, secret string, expireHours int) (string, error)

// 解析
func ParseToken(tokenString, secret string) (*Claims, error)

// 黑名单: 登出时存入 Redis，key=SHA256(token), TTL=Token剩余时间
func BlacklistToken(tokenString, secret string)
```

### 4.7 核心工具函数

```go
// password.go — BCrypt cost=10
func HashPassword(password string) (string, error)
func CheckPassword(hash, password string) bool

// xss.go — html.EscapeString
func EscapeXSS(input string) string

// invitecode.go — crypto/rand, 62 字符集
func GenerateInviteCode(length int) (string, error)

// validator.go
func ValidateUsername(username string) error  // 3-20 位字母数字
func ValidatePassword(password string) error  // >=8 位, 含字母+数字
func ValidateInviteCode(code string) error    // 16 位字母数字
```

### 4.8 注册流程 (事务 + 行锁)

```
1. ValidateUsername + ValidatePassword + ValidateInviteCode
2. Check username exists
3. SELECT * FROM invite_code WHERE code=? FOR UPDATE  (悲观行锁)
4. 校验 IsUsable()
5. BCrypt(password)
6. 事务:
   INSERT sys_user (username, password, role='user', invite_code, status=0)
   UPDATE invite_code SET status=1, use_user_id=?, use_time=NOW()
7. 提交
```

---

## 5. 前端架构

### 5.1 路由表

```typescript
createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <MainLayout />,     // Header + ChatPanel + Outlet
      children: [
        { path: '/',              element: <HomePage /> },
        { path: '/post/create',   element: <PostCreatePage /> },
        { path: '/post/:id',      element: <PostDetailPage /> },
        { path: '/post/:id/edit', element: <PostEditPage /> },
        { path: '/profile',       element: <ProfilePage /> },
        { path: '/profile/edit',  element: <ProfileEditPage /> },
      ],
    }],
  },
  {
    element: <AdminRoute />,
    children: [{
      element: <AdminLayout />,    // Header + Sidebar + ChatPanel + Outlet
      children: [
        { path: '/admin',         element: <AdminDashboard /> },
        { path: '/admin/invites', element: <InviteManage /> },
        { path: '/admin/users',   element: <UserManage /> },
        { path: '/admin/posts',   element: <PostManage /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
```

### 5.2 Axios 客户端

```typescript
const client = axios.create({ baseURL: '/api/v1' });

// 请求拦截器: 自动附加 Bearer Token
client.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器: 解包 data 字段 + 401 跳转登录
client.interceptors.response.use(
  response => response.data.data,      // 自动解包
  error => {
    if (error.response?.data?.code >= 2000 && < 3000) {
      removeToken(); removeUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5.3 AuthContext

```
useReducer: { user, token, isAuthenticated, loading }
Actions: LOGIN_SUCCESS / LOGOUT / INIT_DONE
初始化: useEffect → localStorage 恢复 token/user
login() → API call → localStorage 存储 → dispatch
logout() → clear localStorage → dispatch
```

### 5.4 主题系统 (ThemeContext)

- CSS 变量双主题: `[data-theme="light"]` / `[data-theme="dark"]`
- 反闪烁: `index.html` `<head>` 内联脚本，React 渲染前同步设置 `data-theme`
- Header 按钮切换 ☽/☀
- 全局过渡: `transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s`

### 5.5 Toast + Confirm

- **ToastContext**: `showToast(message, 'success'|'error')`，页面顶部居中，5 秒消失
- **ConfirmContext**: `showConfirm(message): Promise<boolean>`，居中模态框，await 使用

---

## 6. AI 智能助手 (Phase 1)

> 实施日期: 2026-05-27 ~ 2026-05-28
> 计划文档: `doc/AI-agent-upgrade-plan.md`

### 6.1 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 浮动聊天面板 | 已完成 | 右下角 FAB 按钮，点击右侧滑出 380px 面板 |
| SSE 流式对话 | 已完成 | 逐字显示 AI 回复 |
| 单会话模式 | 已完成 | 每用户一个活跃会话，自动创建 |
| 上下文压缩 | 已完成 | >16 条消息时，LLM 自动生成摘要 |
| 自动标题 | 已完成 | 首条消息前 10 字符作为会话标题 |
| 频率限制 | 已完成 | 10 次/小时/用户，Redis 固定窗口 |
| 清除上下文 | 已完成 | 软删除会话，自动创建新会话 |
| 打字指示器 | 已完成 | 三个跳动圆点动画 |
| 错误处理 | 已完成 | 限流提示、网络错误提示 |
| 剩余次数显示 | 已完成 | 面板底部实时显示 |

### 6.2 架构

```
┌──────────────────────────────────────────────────┐
│ ChatPanel.tsx (React 组件)                        │
│ - floating FAB button                             │
│ - slide-in panel (380px, 100vh)                   │
│ - textarea + EmojiPicker + SVG send button        │
│ - messages list + streaming bubble                │
│ - rate limit display                              │
│ - clear/close buttons                             │
└──────────┬───────────────────────────────────────┘
           │ fetch + ReadableStream (SSE)
┌──────────▼───────────────────────────────────────┐
│ api/chat.ts                                        │
│ - sendChatMessage(): POST /api/v1/ai/chat (SSE)   │
│ - getSession(): GET /api/v1/ai/sessions           │
│ - deleteSession(): DELETE /api/v1/ai/sessions/:id │
│ - Manual SSE parsing (EventSource 不支持 POST)     │
└──────────┬───────────────────────────────────────┘
           │ HTTP SSE
┌──────────▼───────────────────────────────────────┐
│ handler/ai_handler.go                              │
│ - Chat(): SSE handler (text/event-stream)         │
│ - GetSession() / DeleteSession()                   │
│ - sendSSE(): 格式化 SSE 事件                       │
└──────────┬───────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────┐
│ service/ai_service.go                              │
│ - GetOrCreateSession(): 单会话模式                 │
│ - ChatStream(): 保存用户消息 → 构建上下文 → 流式   │
│ - compressContext(): 滑动窗口摘要 (LLM 自压缩)      │
│ - buildMessages(): System Prompt + Summary + 历史  │
│ - LoadCurrentSession() / GetSession()              │
│ - DeleteSession(): 软删除                          │
└──────────┬───────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────┐
│ llm/client.go                                      │
│ - ChatCompleteStream(): OpenAI 兼容流式调用         │
│ - BaseURL: https://api.deepseek.com/v1             │
│ - Model: deepseek-v4-flash                         │
│ - Timeout: 60s                                     │
│ - MaxTokens: 2048                                  │
│ - Temperature: 0.7                                 │
└──────────┬───────────────────────────────────────┘
           │ HTTPS
┌──────────▼───────────────────────────────────────┐
│ DeepSeek API                                       │
└──────────────────────────────────────────────────┘
```

### 6.3 核心代码逻辑

#### System Prompt
```go
messages := []openai.ChatCompletionMessage{
    {Role: "system", Content: "你是 BaseTalkking 论坛的 AI 助手。你友好、专业，帮助用户解答问题、讨论话题。请用中文回复。"},
}
```

#### 上下文压缩 (滑动窗口)
```go
const maxHistoryMessages = 20  // 最多取 20 条历史
const compressThreshold = 16   // 超过 16 条触发压缩

// 当消息数 >= compressThreshold 时:
// 1. 取早期消息 (总长度 - 6 条保留)
// 2. 调用 LLM 生成不超过 200 字摘要
// 3. 摘要存入 chat_session.summary
// 4. 后续消息在 system prompt 中注入摘要
```

#### SSE 事件格式
```
event: meta
data: {"session_id":123}

event: delta
data: "你好"

event: delta
data: "！"

event: done
data: 

```

前端使用 `fetch + ReadableStream` 手动解析 SSE（EventSource 不支持 POST + Authorization header）。

#### AI 限流 Redis Key
```
Key: rl:ai:{userID}
Limit: 10
Window: 3600s (1 hour)
```

### 6.4 前端 SSE 解析 (关键实现)

```typescript
export function sendChatMessage(
  message: string,
  onMeta: (sessionId: number) => void,
  onDelta: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();
  const token = localStorage.getItem('token');

  fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  }).then(async (response) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data:')) {
          const data = line.slice(6);
          if (currentEvent === 'meta') {
            onMeta(JSON.parse(data).session_id);
          } else if (currentEvent === 'delta') {
            onDelta(JSON.parse(data));
          } else if (currentEvent === 'error') {
            onError(data);
          } else if (currentEvent === 'done') {
            onDone();
          }
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') onError(err.message);
  });

  return controller;
}
```

### 6.5 前端状态管理 (ChatPanel)

关键状态:
- `open` / `closing` — 面板开关 + 关闭动画
- `messages` — 消息列表
- `sessionId` — 当前会话 ID
- `streaming` — 是否正在接收流式响应 (控制 textarea disabled 和发送按钮)
- `streamingContent` — 当前流式内容的累积显示
- `remaining` — 剩余 API 调用次数
- `streamingRef` (useRef) — 追踪流式内容最新值，避免闭包陷阱
- `doneRef` (useRef) — 防重入 guard，防止 onDone 被多次调用

消息发送后 onDone 处理:
```
1. doneRef 检查 (防重入)
2. 从 streamingRef.current 读取完整 AI 回复
3. 添加到 messages 数组
4. 清空 streamingContent
5. 设置 streaming=false → textarea 恢复可用
```

### 6.6 CSS 动画

```css
@keyframes chatSlideIn   { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes chatSlideOut  { from { transform: translateX(0); }    to { transform: translateX(100%); } }
@keyframes typingBounce  { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
@keyframes fabPulse      { 0%,100% { box-shadow: 0 2px 12px rgba(24,144,255,0.3); } 50% { box-shadow: 0 2px 24px rgba(24,144,255,0.55); } }
@keyframes fadeInUp      { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
```

---

## 7. 评论置顶功能

> 实施日期: 2026-05-28
> 迁移文件: `006_comment_pin.sql`

### 7.1 功能说明

帖主 (post owner) 可以将自己帖子下的任意顶级评论置顶/取消置顶。置顶评论在列表中排在最前面。

### 7.2 数据库变更

```sql
ALTER TABLE `forum_comment` ADD COLUMN `is_pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '0-正常 1-置顶' AFTER `status`;
CREATE INDEX `idx_post_pinned` ON `forum_comment` (`post_id`, `is_pinned`);
```

### 7.3 后端实现

**Model** (`forum_comment.go`):
```go
type Comment struct {
    // ...
    IsPinned  int8  `gorm:"default:0" json:"is_pinned"`
    // ...
}
```

**Repository** (`comment_repo.go`):
```go
// SetPinned 置顶/取消置顶
func (r *CommentRepo) SetPinned(id uint, pinned int8) error {
    return r.db.Model(&Comment{}).Where("id = ?", id).
        Update("is_pinned", pinned).Error
}

// FindTopLevelByPost 排序: is_pinned DESC, create_time ASC
```

**Service** (`comment_service.go`):
```go
func (s *CommentService) PinComment(postID, commentID, userID uint) (int8, error) {
    // 1. 校验帖子存在
    // 2. 校验 userID == post.UserID (仅帖主)
    // 3. 校验评论存在且属于该帖子
    // 4. 校验评论是顶级评论 (parent_id IS NULL)
    // 5. Toggle: is_pinned=1 → 0, is_pinned=0 → 1
    // 6. 保存并返回新的 pinned 状态
}
```

**Handler** (`comment_handler.go`):
```
PUT /api/v1/comments/:id/pin
Request: { "post_id": 123 }
Response: { "code": 200, "data": { "is_pinned": 1 } }
```

### 7.4 前端实现

**API** (`comment.ts`):
```typescript
export const pinComment = (commentId: number, postId: number): Promise<{ is_pinned: number }> => {
  return client.put(`/comments/${commentId}/pin`, { post_id: postId });
};
```

**Type** (`comment.ts`):
```typescript
interface Comment {
  // ...
  is_pinned: number;
}
```

**CommentList**: 接收 `postOwnerId` prop，传递给每个 `CommentItem` 的 `isPostOwner` prop。

**CommentItem**: 当 `isPostOwner` 为 true 时，在操作栏显示 📌 置顶/取消置顶按钮。

---

## 8. 自定义表情选择器

> 实施日期: 2026-05-28

### 8.1 功能说明

在所有文本输入区域（发帖、评论、AI 对话）旁边添加表情选择按钮。完全自研，零外部依赖。

### 8.2 组件结构

```
EmojiPicker.tsx
├── SVG 笑脸触发按钮 (var(--color-text-hint) 颜色，细线风格)
├── 弹出面板 (position: absolute, bottom: 100%)
│   ├── 分类标签栏 (表情/手势/爱心/物品/自然)
│   └── 表情网格 (flexbox, 35×32px 固定单元格, 8 列 = 280px)
└── 点击外部关闭 (mousedown 事件监听)
```

### 8.3 表情数据 (`emojiData.ts`)

5 个分类，共 ~80 个 emoji:
- 表情 (😀😃😄...🫡) — 32 个
- 手势 (👍👎👏...✋) — 16 个
- 爱心 (❤️🧡💛...💌) — 16 个
- 物品 (🎁🎉...🎵) — 24 个
- 自然 (🌞🌝...🫧) — 16 个

### 8.4 插入逻辑

```typescript
const insertEmoji = (emoji: string) => {
  const ta = textareaRef.current;
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const newValue = content.slice(0, start) + emoji + content.slice(end);
  setContent(newValue);
  requestAnimationFrame(() => {
    ta.selectionStart = ta.selectionEnd = start + emoji.length;
    ta.focus();
  });
};
```

### 8.5 使用位置

- `PostForm.tsx` — 发帖/编辑帖子的 content textarea
- `CommentForm.tsx` — 评论/回复的 textarea
- `ChatPanel.tsx` — AI 对话的 textarea

---

## 9. UI/UX 改进记录

| 日期 | 改进 | 文件 | 说明 |
|------|------|------|------|
| 2026-05-27 | 登录页标题 | LoginPage.tsx | "登录交流基地" → "Welcome to BaseTalkking" |
| 2026-05-27 | 浏览器标签 | index.html | Title → "BaseTalkking" |
| 2026-05-27 | 网站图标 | public/favicon.svg | 替换 Vite 默认图标为蓝色 "B" |
| 2026-05-27 | Enter 行为 | PostForm, CommentForm, ChatPanel | Enter=换行, Shift+Enter=提交 |
| 2026-05-28 | 返回按钮 | PostDetailPage, PostCreatePage, PostEditPage | "← 返回首页" / "← 返回" / "← 返回帖子" |
| 2026-05-28 | 表情选择器 | EmojiPicker, emojiData, PostForm, CommentForm, ChatPanel | 自定义 emoji picker，SVG 笑脸触发按钮 |
| 2026-05-28 | 评论置顶 | CommentItem, CommentList, PostDetailPage | 帖主可见 📌 按钮 |

---

## 10. Bug 修复记录

### 10.1 帖子缓存失效 Bug

**问题**: 发新帖后首页不显示新帖子。
**原因**: `RDB.Del("cache:posts:list:1:*")` — Redis DEL 不支持 glob 通配符，`*` 被当作字面量。
**修复**: 改为调用已有的 `InvalidatePostCache()` 方法，使用 SCAN 遍历删除。
**文件**: `server/internal/service/post_service.go`

### 10.2 AI 对话完成后 UI 卡死

**问题**: AI 回复完毕后 textarea 仍然 disabled，无法再次输入。
**原因**: 后端 `sendSSE` 对空 data 的 `done` 事件输出 `data:\n`（无空格），但前端解析检查 `line.startsWith('data: ')`（要求空格），`done` 事件永远无法被解析，`setStreaming(false)` 永远不调用。
**修复**:
- 后端: `data:\n` → `data: \n` (符合 SSE 规范)
- 前端: `startsWith('data: ')` → `startsWith('data:')` (更宽松)
**文件**: `server/internal/handler/ai_handler.go`, `client/src/api/chat.ts`

### 10.3 AI 回复出现两条重复消息

**问题**: AI 回复在聊天面板中出现两次。
**原因**: `onDone` 回调中将 `setMessages` 嵌套在 `setStreamingContent` 的函数式更新内，React 处理嵌套更新时可能出现中间状态（streamingContent 和 messages 同时包含 AI 回复）。
**修复**: 使用 `streamingRef` (useRef) 追踪流式内容，`doneRef` 防重入，将三个 setState 改为平级调用：
```typescript
const streamingRef = useRef('');
const doneRef = useRef(false);

// onDelta:
(delta) => {
  streamingRef.current += delta;
  setStreamingContent(streamingRef.current);
}

// onDone:
() => {
  if (doneRef.current) return;
  doneRef.current = true;
  const content = streamingRef.current;
  if (content) {
    setMessages((msgs) => [...msgs, { ...aiMsg, content }]);
  }
  setStreamingContent('');
  setStreaming(false);
}
```
**文件**: `client/src/components/Chat/ChatPanel.tsx`

---

## 11. 配置与环境变量

### 11.1 开发配置 (config.dev.yaml)

```yaml
server:
  port: 8080
  mode: debug

database:
  mysql:
    host: 127.0.0.1
    port: 3306
    user: root
    password: "123456"
    dbname: basetalkking
    charset: utf8mb4
    max_open_conns: 25
    max_idle_conns: 5
    conn_max_lifetime: 3600

redis:
  host: 127.0.0.1
  port: 6379
  password: ""
  db: 0
  pool_size: 20

jwt:
  secret: "dev-secret-do-not-use-in-production"
  expire_hours: 168

invite_code:
  length: 16

log:
  level: debug
  file: ""

openai:
  api_key: ""                              # 从 .env OPENAI_API_KEY 覆盖
  base_url: "https://api.deepseek.com/v1"
  model: "deepseek-v4-flash"
  embedding_model: "text-embedding-3-small"
  max_tokens: 2048
  temperature: 0.7
  timeout: 60
```

### 11.2 .env 文件 (gitignored)

```bash
# server/.env
OPENAI_API_KEY=sk-your-api-key-here
```

### 11.3 配置加载流程

```go
func Load(env string) error {
    _ = godotenv.Load()           // 1. 加载 .env 文件
    viper.ReadInConfig()           // 2. 加载 config.{env}.yaml
    viper.Unmarshal(&Cfg)          // 3. 反序列化
    // 4. 环境变量覆盖 (OPENAI_API_KEY, DB_MYSQL_USER, DB_MYSQL_PASSWORD, etc.)
}
```

### 11.4 .env.example

```bash
MYSQL_ROOT_PASSWORD=change-me
DB_MYSQL_USER=app_user
DB_MYSQL_PASSWORD=app_user_password_change_me
REDIS_PASSWORD=
JWT_SECRET=change-me-to-a-strong-random-string
OPENAI_API_KEY=sk-your-api-key-here
```

### 11.5 Vite 代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
});
```

---

## 12. 启动步骤

### 12.1 本地开发

```bash
# 1. 确保 MySQL 8.0 和 Redis 7 已启动
#    (或使用: docker compose up -d mysql redis)

# 2. 创建数据库 + 导入迁移
mysql -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS basetalkking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/001_init.sql
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/002_seed.sql
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/003_comment_like.sql
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/004_app_user.sql
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/005_ai_chat.sql
mysql -uroot -p123456 --default-character-set=utf8mb4 basetalkking < server/migrations/006_comment_pin.sql

# 3. 配置 API Key
cp .env.example server/.env
# 编辑 server/.env，填入 OPENAI_API_KEY

# 4. 启动后端
cd server
go build -o basetalkking.exe ./cmd/basetalkking
./basetalkking.exe
# 监听 :8080

# 5. 启动前端 (新终端)
cd client
npm install
npm run dev
# 监听 :5173

# 6. 访问 http://localhost:5173
# 管理员账号: admin / admin123
```

### 12.2 Docker Compose 生产部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 填入所有密码和密钥

# 2. 构建并启动
docker compose -f docker-compose.prod.yml up -d --build

# 3. 导入数据库
docker exec -i bt-mysql mysql -uapp_user -p"${DB_MYSQL_PASSWORD}" --default-character-set=utf8mb4 basetalkking < server/migrations/001_init.sql
# ... 依次导入所有迁移

# 4. 访问 https://your-domain.com
```

---

## 附录 A: 关键设计决策

| 决策 | 方案 | 原因 |
|------|------|------|
| LLM 调用 | go-openai SDK (兼容模式) | DeepSeek 兼容 OpenAI API，无需专用 SDK |
| API Key 管理 | .env 文件 + godotenv | 敏感信息不入 Git，环境变量覆盖 YAML |
| 流式传输 | SSE (fetch + ReadableStream) | EventSource 不支持 POST 和自定义 header |
| 上下文压缩 | LLM 自压缩 (200 字摘要) | 无需引入外部摘要模型，利用现有 LLM |
| AI 限流 | Redis 固定窗口 | 对论坛场景足够，简单可靠 |
| 单会话模式 | 每用户一个活跃会话 | Phase 1 简化，Phase 3 计划支持多会话 |
| 会话删除 | 软删除 (status=1) | 保留数据便于审计 |
| 评论置顶 | Toggle (is_pinned 0↔1) | 再次点击取消置顶 |
| 表情选择器 | 自研，零依赖 | 体积小 (~80 emoji)，无需引入 emoji-mart 等库 |
| Emoji 面板定位 | position:absolute + bottom:100% | 相对于触发按钮定位，不依赖视口 |
| 返回按钮 | 页面级按钮 | PostDetail/PostCreate/PostEdit 均有返回导航 |
| Enter 行为 | Enter=换行, Shift+Enter=提交 | 中文论坛习惯，方便多行输入 |

## 附录 B: 已知待办 (Phase 2+)

- [ ] RAG 知识库: 帖子向量化 + 语义检索 (post_embedding 表已建)
- [ ] 多会话管理: 会话列表、切换、重命名
- [ ] 帖子 AI 摘要生成
- [ ] AI 智能回复建议
- [ ] AI 内容审核 (垃圾/违规检测)
- [ ] 工具调用 (Function Calling): 帖子搜索、用户查询等
- [ ] 向量数据库迁移 (当前预留 MySQL JSON，计划 Qdrant/Milvus)

---

> 最后更新: 2026-05-28
> 当前阶段: Phase 1 (AI 基础设施 + 基础对话) 完成
> 下一步: Phase 2 (RAG 知识库问答)
