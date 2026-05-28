package middleware

import (
	"log/slog"
	"runtime/debug"

	"basetalkking/internal/model/response"
	"basetalkking/internal/pkg/errcode"

	"github.com/gin-gonic/gin"
)

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				slog.Error("panic recovered",
					"error", err,
					"stack", string(debug.Stack()),
				)
				response.Error(c, errcode.CodeInternalError, "服务器内部错误")
				c.Abort()
			}
		}()
		c.Next()
	}
}
