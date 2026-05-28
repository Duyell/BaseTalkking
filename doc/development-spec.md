# BaseTalkking 邀请制论坛 — 完整开发规格书

> 本文档包含足够细节，可在项目丢失后完整复现整个全栈项目。
> 技术栈: Go (Gin) + React (TypeScript) + MySQL 8.0 + Redis + Nginx + Docker

---

## 1. 项目结构

```
BaseTalkking/
├── client/                          # React 前端
│   ├── src/
│   │   ├── api/                     # Axios API 封装
│   │   │   ├── client.ts            # Axios 实例 + 拦截器
│   │   │   ├── auth.ts              # login(), register()
│   │   │   ├── post.ts              # getPostList(), getPostDetail(), createPost(), updatePost(), deletePost()
│   │   │   ├── comment.ts           # getComments(), getReplies(), createComment(), deleteComment(), likeComment()
│   │   │   ├── user.ts              # getProfile(), updateProfile()
│   │   │   └── admin.ts             # getInviteList(), generateInvites(), updateInviteStatus(), getUserList(), banUser(), getAdminPostList(), adminDeletePost(), topPost()
│   │   ├── components/
│   │   │   ├── Auth/                # ProtectedRoute.tsx, AdminRoute.tsx
│   │   │   ├── Layout/              # MainLayout.tsx, AdminLayout.tsx, Header.tsx, Sidebar.tsx
│   │   │   ├── Post/                # PostCard.tsx, PostList.tsx, PostForm.tsx, PostDetail.tsx
│   │   │   ├── Comment/             # CommentItem.tsx, ReplyItem.tsx, ReplyBox.tsx, CommentList.tsx, CommentForm.tsx
│   │   │   └── Common/              # Pagination.tsx, Loading.tsx, Empty.tsx, ErrorBoundary.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # useReducer 全局认证状态
│   │   │   ├── ThemeContext.tsx      # 暗黑/白天模式切换, localStorage持久化
│   │   │   ├── ToastContext.tsx      # 自定义Toast通知 (页面顶部居中, 自动5秒消失)
│   │   │   └── ConfirmContext.tsx    # 自定义确认对话框 (居中模态框, Promise API)
│   │   ├── hooks/                   # (预留) useAuth, usePosts, useComments, usePagination, useDebounce
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx     # 三字段: 用户名 + 密码 + 邀请码
│   │   │   ├── HomePage.tsx         # 帖子列表首页
│   │   │   ├── PostDetailPage.tsx   # 帖子详情 + 评论区
│   │   │   ├── PostCreatePage.tsx
│   │   │   ├── PostEditPage.tsx
│   │   │   ├── ProfilePage.tsx      # 个人中心
│   │   │   ├── ProfileEditPage.tsx
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── InviteManage.tsx
│   │   │       ├── UserManage.tsx
│   │   │       └── PostManage.tsx
│   │   ├── router/index.tsx         # createBrowserRouter 路由表
│   │   ├── types/                   # common.ts, user.ts, post.ts, comment.ts
│   │   ├── utils/                   # storage.ts (getToken/setToken/removeToken/getUser/setUser/removeUser), format.ts (formatRelativeTime/formatDateTime)
│   │   ├── styles/
│   │   │   ├── global.css           # 全局重置 + @import variables.css/animations.css + 全局颜色过渡
│   │   │   ├── variables.css        # CSS自定义属性: [data-theme="light"] / [data-theme="dark"] 双主题
│   │   │   └── animations.css       # btn-ripple涟漪, auth-bg图片背景渐变, toastSlideIn, modal动画, theme-toggle
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html                     # <head>含反闪烁脚本: 同步读取localStorage设置data-theme
│   ├── vite.config.ts               # proxy /api → localhost:8080
│   └── package.json
│
├── server/                          # Go 后端
│   ├── cmd/basetalkking/main.go     # 入口: config.Load → DB/Redis Init → router.Setup → r.Run
│   ├── internal/
│   │   ├── config/config.go         # Viper 配置加载 + 环境变量覆盖
│   │   ├── database/
│   │   │   ├── mysql.go             # GORM + MySQL 连接池
│   │   │   └── redis.go             # go-redis 连接
│   │   ├── model/
│   │   │   ├── user.go              # sys_user (GORM Model, password json:"-")
│   │   │   ├── invite_code.go       # invite_code (含 IsUsable() 方法)
│   │   │   ├── forum_post.go        # forum_post (含 Author *User)
│   │   │   ├── forum_comment.go     # forum_comment (parent_id, reply_to_user_id, like_count, reply_count)
│   │   │   ├── comment_like.go      # comment_like (comment_id, user_id UNIQUE, create_time)
│   │   │   ├── sys_role.go
│   │   │   ├── request/             # 请求 DTO (auth_request, user_request, post_request, comment_request, invite_request, page_request)
│   │   │   └── response/response.go # Response{Code,Message,Data}, PageData, Success/Error/SuccessPage 辅助函数
│   │   ├── repository/              # 数据访问层 (每个 repo 持有 *gorm.DB)
│   │   │   ├── user_repo.go         # FindByUsername, FindByID, Create, Update, ExistsByUsername, List
│   │   │   ├── invite_code_repo.go  # FindByCode, FindByCodeWithLock(SELECT FOR UPDATE), MarkUsed, Create, BatchCreate, List, UpdateStatus
│   │   │   ├── post_repo.go         # Create, FindByID(Preload Author), FindByUserID, FindList(MATCH AGAINST, is_top DESC), AdminFindList, SoftDelete, SetTop
│   │   │   └── comment_repo.go      # Create, FindTopLevelByPost, FindHotReplies(ROW_NUMBER), FindAllReplies, SoftDelete, IncrementReplyCount, ExistsLike, CreateLike, DeleteLike(事务)
│   │   ├── service/                 # 业务逻辑层
│   │   │   ├── auth_service.go      # Register(事务: 加锁邀请码→校验→创建用户→消耗邀请码), Login(BCrypt+JWT)
│   │   │   ├── user_service.go      # GetProfile, UpdateProfile(含XSS过滤)
│   │   │   ├── post_service.go      # CreatePost, GetPostList(Redis缓存60s), GetPostDetail, UpdatePost, DeletePost, InvalidatePostCache
│   │   │   ├── comment_service.go   # CreateComment(校验2级限制, XSS过滤, 增加reply_count), GetCommentsWithReplies(top3), GetReplies, LikeComment(防自赞toggle), DeleteComment
│   │   │   ├── invite_service.go    # GenerateCodes(crypto/rand), ListInvites, UpdateInviteStatus
│   │   │   └── admin_service.go     # UserList, BanUser, UnbanUser, AdminPostList, AdminDeletePost, TopPost(含缓存失效)
│   │   ├── handler/                 # HTTP 处理器 (参数绑定→调Service→组装JSON)
│   │   │   ├── auth_handler.go      # POST /auth/login, /auth/register, /auth/logout
│   │   │   ├── user_handler.go      # GET/PUT /user/profile
│   │   │   ├── post_handler.go      # CRUD /posts, /posts/:id
│   │   │   ├── comment_handler.go   # GET/POST /posts/:id/comments, POST /comments/:id/like, GET/DELETE /comments/:id
│   │   │   └── admin_handler.go     # GET/POST /admin/invites, GET /admin/users, PUT /admin/users/:id/ban, GET/DELETE/PUT /admin/posts
│   │   ├── middleware/
│   │   │   ├── logger.go            # slog 结构化日志 (method, path, status, latency, ip)
│   │   │   ├── recovery.go          # panic recover → 500
│   │   │   ├── cors.go              # 允许 localhost:5173
│   │   │   ├── ratelimit.go         # Redis 计数器: 全局10r/s, 登录5r/min, 注册3r/min
│   │   │   ├── auth.go              # JWT Bearer 解析 + Redis黑名单检查 + Admin()中间件 → 注入 userID/role/tokenString
│   │   │   └── admin.go             # (不存在 — Admin() 中间件定义在 auth.go 中)
│   │   ├── router/router.go         # 路由分组: /ping, /api/v1/auth(公开), /api/v1/* (需认证), /api/v1/admin/* (管理员)
│   │   └── pkg/
│   │       ├── errcode/errcode.go   # 错误码常量 (200/1000参/2000认证/3000业务/4000系统)
│   │       ├── jwt/jwt.go           # GenerateToken(HS256,7天), ParseToken, TokenHash(SHA256)
│   │       ├── e/error.go           # BizError{Code,Message,Err}
│   │       ├── constant/constant.go # RoleAdmin/RoleUser, UserStatus*, CtxUserID/CtxRole (CommentStatus* 在 model/forum_comment.go)
│   │       └── utils/
│   │           ├── password.go      # BCrypt Hash(cost=10)/Compare
│   │           ├── xss.go           # html.EscapeString
│   │           ├── validator.go     # ValidateUsername(3-20alnum), ValidatePassword(≥8,字母+数字), ValidateInviteCode(16alnum)
│   │           └── invitecode.go    # crypto/rand 16位62字符集随机码
│   ├── configs/
│   │   ├── config.dev.yaml          # 开发环境: MySQL:3307, Redis:6379, debug模式
│   │   ├── config.prod.yaml         # 生产环境: release模式
│   │   └── config.example.yaml      # 配置模板(敏感信息留空,上传Git)
│   ├── migrations/
│   │   ├── 001_init.sql             # 5张表 DDL (含 FULLTEXT INDEX, utf8mb4, SET NAMES)
│   │   ├── 002_seed.sql             # 角色 + admin用户(admin/admin123) + 5个邀请码
│   │   └── 003_comment_like.sql     # comment_like表 (comment_id, user_id UNIQUE)
│   ├── deployments/
│   │   ├── Dockerfile               # 多阶段: golang:1.25-alpine → alpine:3.21 (~15MB)
│   │   ├── nginx.conf               # SSL + SPA回退 + /api/反代 + Gzip + 安全头
│   │   └── ssl/                     # SSL 证书目录
│   ├── Makefile                     # run/build/test/docker-build/deploy/dev-infra-up
│   └── go.mod                       # module: basetalkking
│
├── docker-compose.yml               # 本地开发: MySQL 8.0 + Redis 7
├── docker-compose.prod.yml          # 生产环境: MySQL + Redis + Backend + Nginx
├── go.work                          # Go workspace: use ./server
└── doc/
    └── development-spec.md          # 本文档
```

---

## 2. 数据库设计

### 2.1 sys_role — 角色表
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

### 2.2 sys_user — 用户表
```sql
CREATE TABLE `sys_user` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `username`    VARCHAR(50)  NOT NULL UNIQUE,
  `password`    VARCHAR(255) NOT NULL,
  `nickname`    VARCHAR(50)  NOT NULL DEFAULT '',
  `avatar`      VARCHAR(255) NOT NULL DEFAULT '',
  `email`       VARCHAR(100) NOT NULL DEFAULT '',
  `intro`       VARCHAR(255) NOT NULL DEFAULT '',
  `role`        VARCHAR(10)  NOT NULL DEFAULT 'user',
  `status`      TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-封禁',
  `invite_code` VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '注册时使用的邀请码',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_invite_code` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**关键点**: `password` 字段 json tag 为 `-` 防止序列化泄露。

### 2.3 invite_code — 邀请码表
```sql
CREATE TABLE `invite_code` (
  `id`              BIGINT    NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(32)  NOT NULL UNIQUE,
  `status`          TINYINT   NOT NULL DEFAULT 0  COMMENT '0-未使用 1-已使用 2-已过期 3-已禁用',
  `use_user_id`     BIGINT    DEFAULT NULL,
  `create_admin_id` BIGINT    NOT NULL,
  `expire_time`     DATETIME  DEFAULT NULL COMMENT 'NULL=永久有效',
  `use_time`        DATETIME  DEFAULT NULL,
  `create_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_create_admin_id` (`create_admin_id`),
  KEY `idx_use_user_id` (`use_user_id`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**IsUsable() 方法**: `status == 0 AND (expire_time IS NULL OR expire_time > NOW())`

### 2.4 forum_post — 帖子表
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
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top_create_time` (`is_top`, `create_time`),
  FULLTEXT KEY `ft_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**排序规则**: `ORDER BY is_top DESC, create_time DESC`
**搜索**: `MATCH(title) AGAINST(? IN BOOLEAN MODE)` (FULLTEXT)

### 2.5 forum_comment — 评论表（核心：两级评论）
```sql
CREATE TABLE `forum_comment` (
  `id`                BIGINT    NOT NULL AUTO_INCREMENT,
  `post_id`           BIGINT    NOT NULL,
  `parent_id`         BIGINT    DEFAULT NULL  COMMENT 'NULL=顶级评论, 非NULL=指向父评论ID',
  `reply_to_user_id`  BIGINT    DEFAULT NULL  COMMENT '被@的用户ID (仅二级回复有值)',
  `user_id`           BIGINT    NOT NULL,
  `content`           TEXT      NOT NULL,
  `like_count`        INT       NOT NULL DEFAULT 0,
  `reply_count`       INT       NOT NULL DEFAULT 0  COMMENT '子回复数(冗余, 避免COUNT)',
  `status`            TINYINT   NOT NULL DEFAULT 0  COMMENT '0-正常 1-已删除',
  `create_time`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_parent` (`post_id`, `parent_id`),
  KEY `idx_parent_like` (`parent_id`, `like_count`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**评论查询三步走**:
1. 顶级评论: `WHERE post_id=? AND parent_id IS NULL ORDER BY create_time ASC LIMIT ? OFFSET ?`
2. 热门回复(top 3): 使用 `ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY like_count DESC, create_time ASC)` 窗口函数
3. 展开更多: `WHERE parent_id=? ORDER BY like_count DESC, create_time ASC LIMIT ? OFFSET ?`

**二级限制**: Service 层校验 `parent_id` 对应的评论必须 `parent_id IS NULL`（即只能回复顶级评论）

### 2.6 comment_like — 评论点赞表
```sql
CREATE TABLE `comment_like` (
  `id`          BIGINT    NOT NULL AUTO_INCREMENT,
  `comment_id`  BIGINT    NOT NULL,
  `user_id`     BIGINT    NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comment_user` (`comment_id`, `user_id`),
  KEY `idx_comment_id` (`comment_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**点赞Toggle**: 再点即取消(UNIQUE约束保证一人一赞)，事务中原子操作 `INSERT + like_count+1` 或 `DELETE + GREATEST(like_count-1,0)`，禁止自赞(CodeSelfLike=3011)。

---

## 3. 种子数据

```sql
SET NAMES utf8mb4;

-- 角色
INSERT INTO `sys_role` (`role_name`, `role_key`, `description`) VALUES
  ('系统管理员', 'admin', '系统超级管理员，拥有所有权限'),
  ('普通用户',   'user',  '普通注册用户');

-- 管理员 (admin / admin123)
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `role`, `status`, `intro`) VALUES
  ('admin',
   '$2a$10$ZfqWOrooATu3tOFfB1EaFOpoMTC2usO5XtZztgXK4P3fpCBnxWcEi',
   '系统管理员', 'admin', 0, '系统默认管理员账号');

-- 5 个永久有效邀请码
INSERT INTO `invite_code` (`code`, `status`, `create_admin_id`, `expire_time`) VALUES
  ('AbCdEfGhIjKlMnOp', 0, 1, NULL),
  ('QrStUvWxYz123456', 0, 1, NULL),
  ('BaseTalkking0001', 0, 1, NULL),
  ('Invite2026ForumZ', 0, 1, NULL),
  ('GoReactFullStack', 0, 1, NULL);
```

> **关键**: SQL 文件必须以 `SET NAMES utf8mb4;` 开头，否则中文乱码。

---

## 4. 后端架构

### 4.1 分层架构（严格单向依赖）

```
Handler (参数绑定 + JSON 响应) → Service (业务逻辑 + 事务) → Repository (GORM CRUD)
```

**规则**:
- Handler 不操作数据库，不写业务逻辑
- Service 不操作 HTTP 对象 (gin.Context)
- Repository 不写业务逻辑

### 4.2 中间件链

| 中间件 | 范围 | 功能 |
|--------|------|------|
| Logger | 全局 | slog 记录 method/path/status/latency/ip |
| Recovery | 全局 | defer recover() → 500 + 堆栈 |
| CORS | 全局 | 允许 origin: localhost:5173, credentials:true |
| RateLimit(10, 1s) | 全局 | Redis 计数器, 每IP每秒10次 |
| LoginRateLimit | /auth/login | 每IP每分钟5次 |
| RegisterRateLimit | /auth/register | 每IP每分钟3次 |
| Auth | /api/v1/* 除 /auth | JWT Bearer 解析 + Redis 黑名单检查 |
| Admin | /api/v1/admin/* | role=="admin" 校验 |

### 4.3 API 路由表

```
公开接口 (无需认证):
  POST /api/v1/auth/login       — 登录 (限流: 5/min/IP)
  POST /api/v1/auth/register    — 注册 (限流: 3/min/IP)

认证接口:
  POST /api/v1/auth/logout      — 登出 (token加入Redis黑名单)
  GET  /api/v1/user/profile     — 获取个人信息
  PUT  /api/v1/user/profile     — 更新个人信息
  GET  /api/v1/posts            — 帖子列表 (分页+搜索)
  GET  /api/v1/posts/:id        — 帖子详情
  POST /api/v1/posts            — 发布帖子
  PUT  /api/v1/posts/:id        — 编辑帖子 (仅作者)
  DELETE /api/v1/posts/:id      — 删除帖子 (作者或管理员)
  GET  /api/v1/posts/:id/comments — 评论列表 (顶级+top3回复)
  POST /api/v1/posts/:id/comments — 发表评论/回复
  GET  /api/v1/comments/:id/replies — 展开全部子回复
  POST /api/v1/comments/:id/like — 点赞/取消点赞评论 (toggle)
  DELETE /api/v1/comments/:id   — 删除评论

管理员接口:
  GET  /api/v1/admin/invites    — 邀请码列表
  POST /api/v1/admin/invites    — 生成邀请码
  PUT  /api/v1/admin/invites/:id/status — 更新邀请码状态(禁用/启用)
  GET  /api/v1/admin/users      — 用户列表
  PUT  /api/v1/admin/users/:id/ban — 封禁/解封
  GET  /api/v1/admin/posts      — 全站帖子列表(含已删除)
  DELETE /api/v1/admin/posts/:id — 管理员删帖
  PUT  /api/v1/admin/posts/:id/top — 置顶/取消置顶
```

### 4.4 错误码体系

| 范围 | 类别 | 常量 |
|------|------|------|
| 200 | 成功 | `CodeSuccess = 200` |
| 1000-1999 | 参数校验 | `CodeParamInvalid=1000`, `CodeParamMissing=1001`, `CodePasswordWeak=1002`, `CodeUsernameInvalid=1003` |
| 2000-2999 | 认证授权 | `CodeUnauthorized=2000`, `CodeTokenExpired=2001`, `CodeTokenInvalid=2002`, `CodeForbidden=2003`, `CodeUserBanned=2004` |
| 3000-3999 | 业务逻辑 | `CodeUserExists=3000`, `CodeUserNotFound=3001`, `CodePasswordWrong=3002`, `CodeInviteInvalid=3003`, `CodeInviteUsed=3004`, `CodeInviteExpired=3005`, `CodeInviteDisabled=3006`, `CodePostNotFound=3007`, `CodeCommentNotFound=3008`, `CodeNotPostOwner=3009`, `CodeNotCommentOwner=3010`, `CodeSelfLike=3011` |
| 4000-4999 | 系统错误 | `CodeInternalError=4000`, `CodeDatabaseError=4001`, `CodeRedisError=4002`, `CodeRateLimited=4003` |

统一响应格式: `{ "code": 200, "message": "success", "data": {...} }`

### 4.5 统一响应辅助函数

```go
// response.go 核心函数
func Success(c *gin.Context, data any)              // {code:200, message:"success", data:data}
func SuccessPage(c, list, total, page, pageSize)    // {code:200, data:{list, total, page, page_size}}
func Error(c *gin.Context, code int, message string) // {code, message}
func ErrorWithStatus(c, httpStatus, code, message)  // 带HTTP状态码的错误响应

// handler 中统一错误处理
func handleBizError(c *gin.Context, err error) {
    var bizErr *e.BizError
    if errors.As(err, &bizErr) {
        response.Error(c, bizErr.Code, bizErr.Message)
        return
    }
    response.Error(c, errcode.CodeInternalError, "服务器内部错误")
}
```

### 4.6 核心工具函数

```go
// jwt.go
func GenerateToken(userID uint, role, secret string, expireHours int) (string, error)
func ParseToken(tokenString, secret string) (*Claims, error)
func TokenHash(tokenString string) string  // SHA256, 用于Redis黑名单key

// password.go
func HashPassword(password string) (string, error)    // bcrypt.DefaultCost
func CheckPassword(hash, password string) bool

// xss.go
func EscapeXSS(input string) string  // html.EscapeString

// invitecode.go
func GenerateInviteCode(length int) (string, error)  // crypto/rand, 62字符集

// validator.go
func ValidateUsername(username string) error  // 3-20位字母数字
func ValidatePassword(password string) error  // ≥8位, 含字母+数字
func ValidateInviteCode(code string) error    // 16位字母数字
```

### 4.7 注册流程（事务 + 行锁）

```
1. ValidateUsername + ValidatePassword + ValidateInviteCode
2. Check username exists
3. SELECT * FROM invite_code WHERE code=? FOR UPDATE  (悲观行锁)
4. 校验邀请码 IsUsable()
5. hash = BCrypt(password)
6. 开启事务:
   INSERT INTO sys_user (username, password, role='user', invite_code=code, status=0)
   UPDATE invite_code SET status=1, use_user_id=?, use_time=NOW() WHERE id=?
7. 事务提交
```

### 4.8 Redis 使用方案

| Key 格式 | 用途 | TTL |
|----------|------|-----|
| `rl:global:{ip}` | 全局限流 | 1s |
| `rl:login:{ip}` | 登录限流 | 60s |
| `rl:register:{ip}` | 注册限流 | 60s |
| `jwt:bl:{sha256(token)}` | JWT 黑名单 | Token 剩余有效期 |
| `cache:posts:list:{page}:{size}` | 帖子列表缓存 | 60s |

**缓存失效**: CreatePost/DeletePost/TopPost 时调用 `InvalidatePostCache()` 删除所有 `cache:posts:list:*`。

### 4.9 限流实现

```go
func checkRate(key string, limit int, window time.Duration) bool {
    count, err := database.RDB.Incr(ctx, key).Result()
    if err != nil { return true }  // Redis不可用时放行
    if count == 1 { database.RDB.Expire(ctx, key, window) }
    return count <= int64(limit)
}
```

### 4.10 JWT 黑名单

```go
// 登出时
func BlacklistToken(tokenString, secret string) {
    claims, _ := jwtutil.ParseToken(tokenString, secret)
    ttl := time.Until(claims.ExpiresAt.Time)
    if ttl > 0 {
        database.RDB.Set(ctx, "jwt:bl:"+jwtutil.TokenHash(tokenString), "1", ttl)
    }
}

// Auth 中间件检查
blacklistKey := "jwt:bl:" + jwtutil.TokenHash(tokenString)
exists, _ := database.RDB.Exists(ctx, blacklistKey).Result()
if exists > 0 { /* 拒绝 */ }
```

---

## 5. 前端架构

### 5.1 路由表

```typescript
const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <MainLayout />,     // Header + Outlet
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
    element: <AdminRoute />,       // role=="admin" 校验
    children: [{
      element: <AdminLayout />,    // Header + Sidebar + Outlet
      children: [
        { path: '/admin',         element: <AdminDashboard /> },
        { path: '/admin/invite',  element: <InviteManage /> },
        { path: '/admin/users',   element: <UserManage /> },
        { path: '/admin/posts',   element: <PostManage /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
```

### 5.2 Axios 客户端 (client.ts)

```typescript
const client = axios.create({ baseURL: '/api/v1' });

// 请求拦截器: 自动附加 Bearer Token
client.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器: 统一错误处理 + 401 跳转登录
client.interceptors.response.use(
  response => response.data.data,     // 解包: 返回 data 字段
  error => {
    if (error.response?.data?.code >= 2000 && error.response?.data?.code < 3000) {
      removeToken(); removeUser(); window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5.3 AuthContext (useReducer 模式)

```typescript
// State: { user, token, isAuthenticated, loading }
// Actions: LOGIN_START → LOGIN_SUCCESS | LOGOUT | INIT_DONE
// login() → call API → store token+user in localStorage → dispatch LOGIN_SUCCESS
// logout() → clear localStorage → dispatch LOGOUT
// 初始化: useEffect 从 localStorage 恢复 token/user
```

### 5.4 组件关键模式

**PostList 数据流**: `useEffect(page, keyword)` → `getPostList()` → `{list, total}` → `PostCard[]` + `Pagination`

**评论系统数据流**:
```
CommentList (管理状态)
├── CommentForm (顶级评论输入)
├── CommentItem[] (顶级评论列表)
│   │
│   └── ReplyBox (楼中楼容器)
│       ├── ReplyItem[] (最多3条热评, 小号字体12px, 缩进)
│       ├── "展开 N 条回复 ›" 链接 → fetch全部 → loading/collapse
│       └── CommentForm (回复输入框, 显示"@nickname"覆盖层)
└── Pagination
```

**CommentForm 的 reply 模式**: 
- `parentID` 传入时显示 `@nickname 回复中...` 覆盖层
- 点击取消清除覆盖层
- autoFocus 自动对焦

**Header 组件**:
- 显示 Logo "交流基地" + 首页链接
- 管理员显示红色 "管理后台" 链接
- 用户昵称下拉 → 个人中心
- 退出按钮 → logout + navigate /login

### 5.5 关键类型定义

```typescript
// types/post.ts
interface Post {
  id: number; title: string; content: string; user_id: number;
  is_top: number; status: number; create_time: string;
  author?: { id: number; nickname: string; avatar: string };
}

// types/comment.ts
interface Comment {
  id: number; post_id: number; parent_id: number | null;
  reply_to_user_id: number | null; user_id: number; content: string;
  like_count: number; reply_count: number; status: number; create_time: string;
  user: { id: number; nickname: string; avatar: string };
  reply_to_user?: { id: number; nickname: string } | null;
  replies?: ReplyItem[];
  has_more_replies: boolean;
}

// types/common.ts
interface ApiResponse<T> { code: number; message: string; data: T; }
interface PaginatedData<T> { list: T[]; total: number; page: number; page_size: number; }
```

---

## 6. 前端 UI 增强

### 6.1 暗黑模式 (ThemeContext)

- `ThemeContext` 管理 `'light' | 'dark'` 状态，`localStorage` 持久化
- CSS 变量双主题: `[data-theme="light"]` / `[data-theme="dark"]` 定义在 `variables.css`
- 全局过渡: `*,*::before,*::after { transition: background-color 0.3s,color 0.3s,border-color 0.3s,box-shadow 0.3s; }`
- 反闪烁: `index.html` `<head>` 内联脚本，React 渲染前同步设置 `data-theme` 属性
- Header 右侧圆形按钮切换 ☽/☀ 图标，hover 旋转动画

### 6.2 Toast 通知 (ToastContext)

- `showToast(message, type)` API，type 为 `'success'` (绿) 或 `'error'` (红)
- 固定定位页面顶部居中，`toastSlideIn` 动画入场，5 秒后自动消失
- 替换所有 `alert()` 调用

### 6.3 确认对话框 (ConfirmContext)

- `showConfirm(message): Promise<boolean>` API，`await` 使用
- 居中模态框: 遮罩层 `rgba(0,0,0,0.45)` + 白色卡片 + "取消"/"确定" 两按钮居中对称
- 替换所有 `confirm()` 调用

### 6.4 登录/注册页背景

- `.auth-bg` CSS 类: `background: url('/images/auth-bg.jpg') center / cover no-repeat`
- `::before` 伪元素半透明黑色遮罩 `rgba(0,0,0,0.45)` 淡化背景
- `::after` 伪元素浮动光斑动画 (`@keyframes float`)
- 表单卡片在遮罩上层 (`z-index: 1`)

### 6.5 按钮涟漪特效

- `.btn-ripple` 类: 点击时 `scale(0.95)` + `::after` 伪元素扩散圆形涟漪
- 仅用于提交按钮，不在 form/input 上使用

### 6.6 管理后台搜索

- UserManage: 用户名/昵称模糊搜索输入框，Enter 或点击搜索触发
- PostManage: 帖子标题模糊搜索输入框，Enter 或点击搜索触发

---

## 7. 部署配置

### 6.1 Dockerfile（多阶段构建）

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o basetalkking ./cmd/basetalkking

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Shanghai
WORKDIR /app
COPY --from=builder /app/basetalkking .
COPY --from=builder /app/configs ./configs
EXPOSE 8080
ENTRYPOINT ["./basetalkking", "-env", "prod"]
```

### 6.2 Nginx 配置要点

```nginx
# SPA 回退
location / { try_files $uri $uri/ /index.html; }

# API 反代
location /api/ {
    proxy_pass http://backend:8080;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 静态资源强缓存
location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }

# 安全头: X-Frame-Options DENY, X-Content-Type-Options nosniff, HSTS
```

### 6.3 Vite 配置

```typescript
export default defineConfig({
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } },
});
```

### 6.4 开发配置 (config.dev.yaml)

```yaml
server: { port: 8080, mode: debug }
database: { mysql: { host: "127.0.0.1", port: 3307, user: "root", password: "root123", dbname: "basetalkking", charset: "utf8mb4" } }
redis: { host: "127.0.0.1", port: 6379, password: "", db: 0, pool_size: 20 }
jwt: { secret: "dev-secret-do-not-use-in-production", expire_hours: 168 }
```

### 6.5 启动步骤

```bash
# 1. 启动基础设施
docker compose up -d mysql redis          # 生产环境
# 或本地已有MySQL/Redis则跳过

# 2. 导入数据库 (首次)
docker exec -i bt-mysql mysql -uroot -proot123 --default-character-set=utf8mb4 basetalkking < migrations/001_init.sql
docker exec -i bt-mysql mysql -uroot -proot123 --default-character-set=utf8mb4 basetalkking < migrations/002_seed.sql

# 3. 启动后端
cd server && go run ./cmd/basetalkking -env dev

# 4. 启动前端
cd client && npm install && npm run dev

# 5. 访问 http://localhost:5173
# 管理员: admin / admin123
```

---

## 8. 关键设计决策

| 决策 | 方案 | 原因 |
|------|------|------|
| 并发注册 | `SELECT FOR UPDATE` + 事务 | 行锁保证同一邀请码不会被两人同时使用 |
| 二级评论 | parent_id + reply_count 冗余 | ROW_NUMBER窗口函数取top3，避免N+1查询 |
| 帖子排序 | is_top DESC + create_time DESC | 置顶优先，新品在上 |
| 帖子缓存 | 仅缓存前3页 + 60s TTL | 首页高频访问，长尾页缓存命中率低 |
| 软删除 | status 字段 | 保留数据，便于审计和恢复 |
| 评论热度 | like_count 降序 (预留) | 百度贴吧模式：二级回复按赞数排序 |
| Token失效 | Redis 黑名单 (SHA256 hash) | 无需修改 JWT 结构，登出后即时失效 |
| 限流 | Redis Incr + Expire | 简单固定窗口，对论坛场景足够 |
| XSS防御 | 后端 html.EscapeString + React JSX 自动转义 | 双重保障，不信任任何用户输入 |
| SQL注入 | GORM 参数化查询全面覆盖 | 不使用字符串拼接 SQL |
| 密码存储 | BCrypt cost=10 | 抗彩虹表，暴力破解成本高 |
| Docker | 多阶段构建 → Alpine | 最终镜像仅 ~15MB |
| Nginx | SSL终止 + SPA + 反代 | 统一入口，安全可控 |

---

## 9. 注意事项

- **SQL 文件编码**: 必须 `SET NAMES utf8mb4;` 开头，导入时加 `--default-character-set=utf8mb4`
- **Redis 降级**: `checkRate()` 在 Redis 连接失败时放行，不阻塞正常请求
- **空数组返回**: Service 层对 nil slice 做保护：`if users == nil { users = []User{} }`
- **前端响应解包**: Axios 拦截器自动从 `response.data.data` 提取数据，组件直接拿到业务数据
- **JWT 过期处理**: 前端拦截器检测 2xxx 错误码自动跳转登录页
- **API 分页参数**: `page` 和 `page_size`，有 `DefaultPage()` 方法（默认 page=1, pageSize=20）
