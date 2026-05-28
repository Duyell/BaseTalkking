# BaseTalkking AI 智能助手 — 升级计划书

> 在现有邀请制论坛基础上，向 Agent 方向演进。采用"AI 智能助手 + 内容增强"路线，OpenAI API (GPT-4o) 驱动，分四个阶段渐进式交付。

---

## 一、项目背景与目标

### 1.1 现状

BaseTalkking 是一个成熟的 Go (Gin) + React (TypeScript) 邀请制论坛系统，具备：

- JWT 认证 + Redis 黑名单，BCrypt 密码加密
- 帖子 CRUD + 全文搜索 + Redis 缓存
- 两级评论系统 + 点赞 toggle
- 邀请码生命周期管理（行锁防并发）
- 管理后台（用户管理、内容审核、邀请码管理）
- Rate Limiting、XSS 防御、软删除
- Docker 容器化部署，Nginx 反代 + SSL

### 1.2 目标

将论坛升级为 **AI 增强型社区**，在不改变核心论坛交互的前提下，增加：

1. **AI 对话助手** — 浮动聊天面板，用户可随时与 AI 交流
2. **RAG 知识库问答** — AI 能检索论坛帖子内容，回答与社区讨论相关的问题
3. **内容智能增强** — 帖子摘要、智能回复建议、AI 辅助搜索
4. **AI 内容审核** — 自动检测垃圾/违规内容，辅助管理员审核

### 1.3 技术选型

| 层面 | 选型 | 说明 |
|------|------|------|
| LLM | OpenAI API (GPT-4o) | 能力最强，生态成熟 |
| Embedding | text-embedding-3-small | 性价比高，1536 维向量 |
| LLM Go SDK | github.com/sashabaranov/go-openai | Go 生态最成熟 |
| 流式传输 | SSE (Server-Sent Events) | Gin 原生支持，兼容 Nginx |
| 向量存储 | Phase 2: MySQL JSON + Go 余弦相似度 / Qdrant | 先简单后升级 |
| 前端 SSE | fetch + ReadableStream | EventSource 不支持 POST |

---

## 二、总体架构演进

```
Phase 1                  Phase 2                  Phase 3 & 4
─────                    ─────                    ──────────
用户 ↔ AI 对话           + RAG 知识检索           + 内容摘要/建议
                         + 帖子向量化索引          + AI 审核/评分
                         
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  ChatPanel  │         │  ChatPanel  │         │  ChatPanel  │
│  (浮动面板)  │         │  + 引用来源  │         │  + 摘要面板  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │ SSE                    │ SSE                    │ SSE
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│  AI Handler │         │  AI Handler │         │  AI Handler │
│  + Service  │         │  + RAG Svc  │         │  + Mod Svc  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│  OpenAI API │         │  OpenAI API │         │  OpenAI API │
│  (Chat)     │         │  (Chat+Emb) │         │  (Chat+Emb) │
└─────────────┘         └──────┬──────┘         └─────────────┘
                               │
                        ┌──────▼──────┐
                        │  Vector DB  │
                        │  / MySQL    │
                        └─────────────┘
```

---

## 三、分阶段实施计划

### Phase 1 — LLM 基础设施 + 基础 AI 对话（本次实施）

**目标**：用户可以在论坛任意页面唤起 AI 聊天面板，进行多轮对话。

**功能清单**：
- 右下角 FAB 浮动按钮，点击展开 AI 聊天面板
- 多轮对话 + 滑动窗口摘要压缩（防 token 膨胀）
- 流式输出（逐字显示，类似 ChatGPT）
- 单会话模式 + "清除上下文"按钮（无多会话切换）
- 自动会话标题（取首条消息前 10 字）
- AI 调用限流：每用户 10 次/小时

**数据库**：3 张新表
- `chat_session` — 会话
- `chat_message` — 消息历史
- `post_embedding` — 帖子向量（预建表，Phase 2 填充）

**API**：3 个新端点
- `POST /api/v1/ai/chat` — SSE 流式对话
- `GET /api/v1/ai/sessions` — 获取当前活跃会话
- `DELETE /api/v1/ai/sessions/:id` — 清除上下文（重置会话）

### Phase 2 — RAG 知识库问答

**目标**：AI 能检索论坛帖子，回答与社区讨论相关的问题，回答时引用来源帖子。

**功能清单**：
- 帖子内容自动向量化（Embedding 索引）
- 用户提问时语义检索相关帖子
- 将检索结果作为上下文注入 LLM
- 回复中引用帖子来源（标题 + 链接）
- Embedding 异步更新（发帖/编辑时触发）

**技术方案**：
- 初期：MySQL 存 JSON 向量 + Go 内存余弦相似度计算 + FULLTEXT 关键词预筛选
- 若帖子量增长，迁移至 Qdrant（Go SDK 成熟，Docker 一行部署）

### Phase 3 — 内容智能增强

**目标**：AI 辅助用户创作和消费内容。

**功能清单**：
- 长帖子一键摘要（"AI 总结"按钮）
- 评论输入框智能建议（"AI 帮我想想怎么回"）
- AI 增强搜索（自然语言搜帖子）
- 每日/每周热门话题 AI 摘要

### Phase 4 — AI 内容审核

**目标**：用 AI 辅助社区治理。

**功能清单**：
- 发帖/评论自动审核（垃圾/违规检测）
- 内容质量评分
- 可疑内容自动标记 → 管理员复核
- 审核统计面板

---

## 四、Phase 1 详细设计

### 4.1 项目结构变更

```
server/internal/
├── config/config.go              ← 修改: 增加 OpenAIConfig
├── llm/                          ← 新增 package
│   ├── client.go                 # OpenAI 客户端封装
│   └── types.go                  # ChatMessage, StreamChunk
├── model/
│   ├── chat_session.go           ← 新增
│   ├── chat_message.go           ← 新增
│   └── post_embedding.go         ← 新增 (Phase 2 启用)
├── repository/
│   └── chat_repo.go              ← 新增
├── service/
│   └── ai_service.go             ← 新增
├── handler/
│   └── ai_handler.go             ← 新增
├── middleware/
│   └── ratelimit.go              ← 修改: 增加 AIChatRateLimit()
├── router/
│   └── router.go                 ← 修改: 注册 AI 路由
└── pkg/errcode/
    └── errcode.go                ← 修改: 增加 5000-5004 错误码

server/migrations/
└── 005_ai_chat.sql               ← 新增

server/configs/
├── config.dev.yaml               ← 修改
├── config.prod.yaml              ← 修改
└── config.example.yaml           ← 修改

client/src/
├── types/chat.ts                 ← 新增
├── api/chat.ts                   ← 新增
├── components/Chat/              ← 新增目录
│   ├── ChatPanel.tsx             # 主面板
│   └── ChatMessageBubble.tsx     # 消息气泡
├── components/Layout/
│   ├── MainLayout.tsx            ← 修改: 引入 ChatPanel
│   └── AdminLayout.tsx           ← 修改: 引入 ChatPanel
└── styles/
    └── chat.css                  ← 新增: 面板动画
```

### 4.2 配置设计

```yaml
# config.dev.yaml / config.prod.yaml 新增段
openai:
  api_key: ""                              # 生产环境通过环境变量 OPENAI_API_KEY 注入
  base_url: "https://api.openai.com/v1"   # 也支持代理地址
  model: "gpt-4o"                         # 对话模型
  embedding_model: "text-embedding-3-small" # 嵌入模型 (Phase 2)
  max_tokens: 2048
  temperature: 0.7
  timeout: 60                             # 秒
```

Go 结构体：
```go
type OpenAIConfig struct {
    APIKey         string  `mapstructure:"api_key"`
    BaseURL        string  `mapstructure:"base_url"`
    Model          string  `mapstructure:"model"`
    EmbeddingModel string  `mapstructure:"embedding_model"`
    MaxTokens      int     `mapstructure:"max_tokens"`
    Temperature    float64 `mapstructure:"temperature"`
    Timeout        int     `mapstructure:"timeout"`
}
```

环境变量覆盖: `OPENAI_API_KEY` → `config.Cfg.OpenAI.APIKey`

### 4.3 数据库设计

```sql
-- chat_session: AI 聊天会话
CREATE TABLE `chat_session` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '会话主键ID',
  `user_id`     BIGINT       NOT NULL                 COMMENT '所属用户ID',
  `title`       VARCHAR(200) NOT NULL DEFAULT ''      COMMENT '会话标题',
  `summary`     VARCHAR(1000) NOT NULL DEFAULT ''     COMMENT '上下文压缩摘要',
  `model`       VARCHAR(50)  NOT NULL DEFAULT 'gpt-4o' COMMENT '使用的模型',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '0-活跃 1-已删除',
  `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status_time` (`user_id`, `status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- chat_message: 对话消息
CREATE TABLE `chat_message` (
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

-- post_embedding: 帖子向量 (Phase 2 填充)
CREATE TABLE `post_embedding` (
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
```

### 4.4 API 接口

统一前缀 `/api/v1/ai`，全部需要 JWT 认证。

| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| `POST` | `/ai/chat` | **SSE 流式对话** | 10次/小时/用户 |
| `GET` | `/ai/sessions` | 获取当前活跃会话及历史消息 | 全局 10/s |
| `DELETE` | `/ai/sessions/:id` | 清除上下文（重置会话） | 全局 10/s |

#### POST /ai/chat — SSE 流式对话（核心接口）

**请求**:
```json
{
  "message": "你好，请帮我总结一下论坛里最近的热门话题"
}
```

**响应** (SSE 事件流):
```
event: meta
data: {"session_id": 42}

event: delta
data: 你好！

event: delta
data: 让我帮你看看最近论坛里的讨论...

event: delta
data: 最近大家主要在讨论...

event: done
data:
```

**SSE 事件类型**:
| 事件 | 数据 | 说明 |
|------|------|------|
| `meta` | `{"session_id": N}` | 首条事件，告知当前会话 ID |
| `delta` | `"文本片段"` | AI 回复的增量文本 |
| `error` | `"错误信息"` | 发生错误 |
| `done` | `""` | 流结束 |

**错误码** (范围 5000-5099):
| 码 | 常量 | 说明 |
|----|------|------|
| 5000 | `CodeAIModelError` | LLM 调用失败 |
| 5001 | `CodeAISessionNotFound` | 会话不存在 |
| 5002 | `CodeAIQuotaExceeded` | AI 调用频率超限 |
| 5003 | `CodeAIStreamError` | 流式响应中断 |
| 5004 | `CodeAINotOwner` | 非会话所有者 |

### 4.5 后端核心逻辑

#### LLM Client (`server/internal/llm/client.go`)

```go
type Client struct {
    client *openai.Client
    cfg    config.OpenAIConfig
}

func NewClient(cfg config.OpenAIConfig) *Client

// 非流式 (备用)
func (c *Client) ChatComplete(ctx context.Context, messages []openai.ChatCompletionMessage) (string, error)

// 流式: 返回 channel，goroutine 中读取 stream 并发送
func (c *Client) ChatCompleteStream(ctx context.Context, messages []openai.ChatCompletionMessage) <-chan StreamChunk
```

`StreamChunk` 结构:
```go
type StreamChunk struct {
    Content string `json:"content"`          // 增量文本
    Done    bool   `json:"done"`             // 是否结束
    Error   string `json:"error,omitempty"`  // 错误信息
}
```

#### AIService.ChatStream 核心流程

```
1. 查找或创建会话:
     FindOrCreateSession(userID) → session
     若 session 为新创建，title 默认为 "新对话"

2. 保存用户消息 (role=user) 到 DB

3. 自动标题:
     if session.Title == "新对话":
       截取用户消息前 10 字符 → UpdateSessionTitle

4. 构建 LLM 上下文:
     System Prompt: "你是 BaseTalkking 论坛的 AI 助手..."
     + 上下文压缩 (见 4.8)
     + FindRecentMessages(sessionID, 20) → 转为 OpenAI 消息格式

5. ctx, cancel := context.WithTimeout(60s)
   streamCh := client.ChatCompleteStream(ctx, messages)

6. 启动 goroutine:
     for chunk := range streamCh:
       累积 fullContent += chunk.Content
       透传 chunk 到 outCh
     将 assistant 消息 (role=assistant, content=fullContent) 存入 DB
     close(outCh)

7. 返回 outCh + sessionID
```

### 4.6 前端核心逻辑

#### SSE 消费 (`client/src/api/chat.ts`)

```typescript
// 使用 fetch + ReadableStream（不用 EventSource，因为需要 POST + Authorization）
function sendChatMessage(
  message: string,
  onMeta: (sessionId: number) => void,   // 首条 meta 事件，告知会话 ID
  onDelta: (content: string) => void,    // 每收到 delta 事件调用
  onDone: () => void,                    // 流结束时调用
  onError: (error: string) => void,      // 出错时调用
): AbortController                       // 返回可取消的控制器
```

实现要点：
- `fetch('/api/v1/ai/chat', { method: 'POST', body: JSON.stringify(data) })`
- `response.body.getReader()` 获取 ReadableStream reader
- 手动解析 SSE 协议: 按 `\n` 分割，识别 `event:` 和 `data:` 行
- `AbortController` 支持用户中途取消

#### ChatPanel 组件

```
┌─────────────────────────────┐
│  AI 助手        [清除] [✕] │  ← 头部
├──────────────────────────────┤
│                              │
│  ┌──────────────────────┐   │
│  │ AI: 你好！           │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ 用户: 帮我看看...     │   │
│  └──────────────────────┘   │
│                              │
├──────────────────────────────┤
│  提示: 每小时 10 次调用      │  ← 限流提示
│  [输入框______________] [→] │  ← 底部输入
└──────────────────────────────┘
  380px 宽，从右侧滑入
```

单会话模式，无侧边栏。顶部"清除"按钮重置上下文。

状态管理：
- 使用 `useState` + `useRef`（无需新增 Context，面板内自治）
- 仅维护单个会话的消息列表，打开面板时从后端拉取历史
- "清除上下文" → 调用 DELETE 接口，前端清空消息列表，用户看到空面板
- 流式渲染优化：ref 累积 delta，`requestAnimationFrame` 节流更新 state
- 消息列表 `useEffect` + `scrollIntoView` 自动滚底

样式：
- 使用现有 CSS 变量：`--color-bg-white`, `--color-primary`, `--color-text`, `--shadow-card` 等
- 动画：`chatSlideIn` (面板滑入), `typingBounce` (思考中三点跳动), `pulse` (FAB 呼吸灯)
- 暗黑模式：自动跟随 `data-theme` 切换

### 4.7 限流设计

AI 接口单独限流，使用 Redis 计数器（复用现有 `checkRate()` 函数）：

```go
func AIChatRateLimit() gin.HandlerFunc {
    // key: "rl:ai:{userID}", limit: 10 per hour
    // 从 Gin context 取 userID (Auth 中间件已注入)
}
```

- 每用户每小时 10 次 AI 请求
- 前端展示剩余调用次数和重置时间
- Redis 不可用时**放行**（与现有限流一致）
- 仅应用于 `/api/v1/ai/chat` 端点

### 4.8 上下文压缩机制

多轮对话会导致 token 持续增长。采用滑动窗口摘要压缩（Sliding Window Summary）解决：

**触发条件**：历史消息超过 16 条时触发压缩。

**压缩流程**：
```
┌─────────────────────────────────────────────┐
│ 历史消息:  [msg1, msg2, ..., msg12, msg13,  │
│            msg14, msg15, msg16, msg17, msg18]│
│  共 18 条                                   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 取前 12 条 → 调 LLM 生成摘要 (约200字)       │
│ 保留后 6 条完整消息 + 摘要作为 system prompt  │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 压缩后上下文:                               │
│   System Prompt: "你是 BaseTalkking AI...  │
│   之前的对话摘要: [摘要内容]"                 │
│   [msg13, msg14, msg15, msg16, msg17, msg18] │
│  (完整消息保持在 ~16 条以内)                 │
└─────────────────────────────────────────────┘
```

**实现要点**：
- 压缩在保存用户消息后、调用 LLM 之前执行
- 摘要存入 `chat_session` 表的 `summary` 字段（新加 `VARCHAR(1000)` 列）
- 压缩用独立的轻量 LLM 调用（可用 gpt-4o-mini 降低成本），不影响主对话
- 后续轮次中若再次触发压缩，将前次摘要与新消息合并重新摘要

### 4.9 实施步骤与文件清单

| 步骤 | 操作 | 文件 |
|------|------|------|
| 1 | 添加 go-openai 依赖 | `server/go.mod` |
| 2 | 新增 OpenAI 配置 | `server/internal/config/config.go`, 3 个 yaml |
| 3 | 新增 AI 错误码 | `server/internal/pkg/errcode/errcode.go` |
| 4 | 建表迁移 | `server/migrations/005_ai_chat.sql` |
| 5 | 新增模型 | `server/internal/model/chat_session.go`, `chat_message.go`, `post_embedding.go` |
| 6 | LLM 客户端 | `server/internal/llm/types.go`, `client.go` |
| 7 | 数据仓库 | `server/internal/repository/chat_repo.go` |
| 8 | 业务服务 | `server/internal/service/ai_service.go` |
| 9 | HTTP 处理器 | `server/internal/handler/ai_handler.go` |
| 10 | 限流中间件 | `server/internal/middleware/ratelimit.go` (新增函数) |
| 11 | 注册路由 | `server/internal/router/router.go` |
| 12 | 前端类型 | `client/src/types/chat.ts` |
| 13 | 前端 API | `client/src/api/chat.ts` |
| 14 | 前端组件 | `client/src/components/Chat/ChatPanel.tsx`, `ChatMessageBubble.tsx` |
| 15 | 前端样式 | `client/src/styles/chat.css` |
| 16 | 引入面板 | `MainLayout.tsx`, `AdminLayout.tsx` |

---

## 五、关键技术决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 向量存储 | Phase 2 引入，初期 MySQL JSON | 避免过早引入新基础设施 |
| 流式协议 | SSE (Gin `c.SSEvent` + `c.Writer.Flush`) | Gin 原生支持，nginx 兼容 |
| LLM 客户端 | go-openai | Go 生态最成熟、最活跃的 OpenAI SDK |
| 上下文窗口 | 最近 20 条 + 滑动窗口摘要压缩 (>16条触发) | 平衡相关性与 token 成本，避免丢失长期记忆 |
| 前端 SSE 消费 | fetch + ReadableStream | EventSource 不支持 POST + 自定义 header |
| 限流粒度 | 每用户 (userID)，非每 IP | AI 资源比普通 API 更珍贵 |
| 会话所有权 | 每次操作校验 userID | 用户只能访问自己的对话 |
| 错误响应 | HTTP 200 + JSON body (与现有一致) | 但 SSE 中途错误通过 SSE error 事件 |

## 六、待确认事项

1. **AI 助手入口**: 右下角 FAB 浮动按钮 vs 顶部 Header 导航图标？建议 FAB，ChatGPT/Claude 模式用户最熟悉
2. **对话可见性**: 用户只能看自己的对话？还是管理员可以看到所有用户的 AI 对话？建议仅自己可见
3. **System Prompt**: 是否需要后台管理面板配置？还是代码中写死？建议 Phase 1 写死，后续加配置
4. **API Key 管理**: 是否需要一个配置管理接口？还是只用环境变量/配置文件？建议环境变量
5. **是否需要单独的 AI 对话页面**（全屏），还是只要浮动面板？建议 Phase 1 先做浮动面板，反馈好再加全屏页面

---

## 七、验收标准

Phase 1 完成标准：

- [ ] OpenAI API 配置正确，后端能正常调用 GPT-4o
- [ ] 用户发送消息后能看到逐字流式回复
- [ ] 对话上下文正确保留（AI 记住之前聊了什么）
- [ ] 历史消息超过 16 条时触发摘要压缩，token 不无限膨胀
- [ ] "清除上下文"按钮可重置对话
- [ ] 会话标题自动生成（首条消息前 10 字）
- [ ] 超过限流阈值 (10次/小时) 后提示"调用频率过高"
- [ ] 前端展示剩余调用次数
- [ ] 暗黑/白天模式切换正常
- [ ] 移动端适配（面板占满屏幕宽度）
- [ ] AI 回复过程中用户可取消（AbortController）
- [ ] 数据库表正确记录所有对话历史
