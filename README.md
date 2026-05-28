# BaseTalkking

邀请制 AI 增强型论坛 —— Go + React + DeepSeek

## 技术栈

- 后端: Go 1.25 + Gin + GORM + Redis
- 前端: React 19 + TypeScript + Vite
- AI: DeepSeek v4-flash (SSE 流式对话)
- 数据库: MySQL 8.0
- 部署: Docker + Nginx + SSL

## 启动

```bash
# 后端
cd server && go build -o basetalkking ./cmd/basetalkking && ./basetalkking

# 前端
cd client && npm install && npm run dev
```

访问 http://localhost:5173
