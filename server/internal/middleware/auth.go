package middleware

import (
	"context"
	"strings"
	"time"

	"basetalkking/internal/config"
	"basetalkking/internal/database"
	"basetalkking/internal/model/response"
	"basetalkking/internal/pkg/errcode"
	jwtutil "basetalkking/internal/pkg/jwt"

	"github.com/gin-gonic/gin"
)

// Auth JWT 认证中间件
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, errcode.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}

		// 提取 Bearer Token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Error(c, errcode.CodeTokenInvalid, "Token格式错误")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 检查 JWT 黑名单
		blacklistKey := "jwt:bl:" + jwtutil.TokenHash(tokenString)
		exists, _ := database.RDB.Exists(context.Background(), blacklistKey).Result()
		if exists > 0 {
			response.Error(c, errcode.CodeTokenInvalid, "Token已失效，请重新登录")
			c.Abort()
			return
		}

		claims, err := jwtutil.ParseToken(tokenString, config.Cfg.JWT.Secret)
		if err != nil {
			code := errcode.CodeTokenInvalid
			if err == jwtutil.ErrTokenExpired {
				code = errcode.CodeTokenExpired
			}
			response.Error(c, code, err.Error())
			c.Abort()
			return
		}

		// 注入用户信息到 Context
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)
		c.Set("tokenString", tokenString) // 用于登出时加入黑名单
		c.Next()
	}
}

// BlacklistToken 将 token 加入黑名单，TTL 设置为剩余有效期
func BlacklistToken(tokenString, secret string) {
	claims, err := jwtutil.ParseToken(tokenString, secret)
	if err != nil {
		return
	}
	key := "jwt:bl:" + jwtutil.TokenHash(tokenString)
	ttl := time.Until(claims.ExpiresAt.Time)
	if ttl > 0 {
		database.RDB.Set(context.Background(), key, "1", ttl)
	}
}

// Admin 管理员权限中间件
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "admin" {
			response.Error(c, errcode.CodeForbidden, "权限不足，仅管理员可操作")
			c.Abort()
			return
		}
		c.Next()
	}
}

// GetUserID 从 Context 中获取当前登录用户 ID
func GetUserID(c *gin.Context) uint {
	id, _ := c.Get("userID")
	return id.(uint)
}

// GetUserRole 从 Context 中获取当前用户角色
func GetUserRole(c *gin.Context) string {
	role, _ := c.Get("role")
	return role.(string)
}
