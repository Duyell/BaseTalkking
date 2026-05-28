package router

import (
	"time"

	"basetalkking/internal/handler"
	"basetalkking/internal/middleware"

	"github.com/gin-gonic/gin"
)

func healthCheck(c *gin.Context) {
	// TODO: DB.Ping / Redis.Ping
	c.JSON(200, gin.H{"status": "ok"})
}

func Setup(mode string) *gin.Engine {
	gin.SetMode(mode)

	r := gin.New()

	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimit(10, 1*time.Second))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.GET("/health", healthCheck)

	v1 := r.Group("/api/v1")
	{
		authH := handler.NewAuthHandler()
		auth := v1.Group("/auth")
		{
			auth.POST("/login", middleware.LoginRateLimit(), authH.Login)
			auth.POST("/register", middleware.RegisterRateLimit(), authH.Register)
		}

		authorized := v1.Group("")
		authorized.Use(middleware.Auth())
		{
			authorized.POST("/auth/logout", authH.Logout)

			user := authorized.Group("/user")
			userH := handler.NewUserHandler()
			{
				user.GET("/profile", userH.GetProfile)
				user.PUT("/profile", userH.UpdateProfile)
			}

			posts := authorized.Group("/posts")
			postH := handler.NewPostHandler()
			{
				posts.GET("", postH.ListPosts)
				posts.GET("/:id", postH.GetPost)
				posts.POST("", postH.CreatePost)
				posts.PUT("/:id", postH.UpdatePost)
				posts.DELETE("/:id", postH.DeletePost)
			}

			comments := authorized.Group("/comments")
			commentH := handler.NewCommentHandler()
			{
				comments.GET("/:id/replies", commentH.GetReplies)
				comments.POST("/:id/like", commentH.LikeComment)
				comments.PUT("/:id/pin", commentH.PinComment)
				comments.DELETE("/:id", commentH.DeleteComment)
			}
			authorized.GET("/posts/:id/comments", commentH.GetComments)
			authorized.POST("/posts/:id/comments", commentH.CreateComment)

			ai := authorized.Group("/ai")
			aiH := handler.NewAIHandler()
			{
				ai.POST("/chat", middleware.AIChatRateLimit(), aiH.Chat)
				ai.GET("/sessions", aiH.GetSession)
				ai.DELETE("/sessions/:id", aiH.DeleteSession)
			}

			admin := authorized.Group("/admin")
			admin.Use(middleware.Admin())
			adminH := handler.NewAdminHandler()
			{
				admin.GET("/invites", adminH.ListInvites)
				admin.POST("/invites", adminH.GenerateInvites)
				admin.GET("/users", adminH.ListUsers)
				admin.PUT("/users/:id/ban", adminH.BanUser)
				admin.GET("/posts", adminH.AdminListPosts)
				admin.DELETE("/posts/:id", adminH.AdminDeletePost)
				admin.PUT("/posts/:id/top", adminH.TopPost)
			}
		}
	}

	return r
}
