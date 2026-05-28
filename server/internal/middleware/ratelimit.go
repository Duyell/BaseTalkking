package middleware

import (
	"context"
	"fmt"
	"time"

	"basetalkking/internal/database"
	"basetalkking/internal/model/response"
	"basetalkking/internal/pkg/errcode"

	"github.com/gin-gonic/gin"
)

// RateLimit 全局限流中间件 (Redis 固定窗口计数器)
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("rl:global:%s", c.ClientIP())
		if !checkRate(key, limit, window) {
			response.Error(c, errcode.CodeRateLimited, "请求过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}

// LoginRateLimit 登录接口限流
func LoginRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("rl:login:%s", c.ClientIP())
		if !checkRate(key, 5, time.Minute) {
			response.Error(c, errcode.CodeRateLimited, "登录尝试过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}

// RegisterRateLimit 注册接口限流
func RegisterRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("rl:register:%s", c.ClientIP())
		if !checkRate(key, 3, time.Minute) {
			response.Error(c, errcode.CodeRateLimited, "注册请求过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AIChatRateLimit AI 对话限流 (10次/小时/用户)
func AIChatRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.Next()
			return
		}
		uid, ok := userID.(uint)
		if !ok {
			c.Next()
			return
		}
		key := fmt.Sprintf("rl:ai:%d", uid)
		if !checkRate(key, 10, time.Hour) {
			response.Error(c, errcode.CodeRateLimited, "AI调用频率过高，请稍后再试（每小时10次）")
			c.Abort()
			return
		}
		c.Next()
	}
}

func checkRate(key string, limit int, window time.Duration) bool {
	ctx := context.Background()
	count, err := database.RDB.Incr(ctx, key).Result()
	if err != nil {
		// Redis 不可用时限流放行，避免误伤
		return true
	}
	if count == 1 {
		database.RDB.Expire(ctx, key, window)
	}
	return count <= int64(limit)
}
