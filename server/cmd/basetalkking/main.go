package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"basetalkking/internal/config"
	"basetalkking/internal/database"
	"basetalkking/internal/router"
)

func main() {
	env := flag.String("env", "dev", "environment: dev|prod")
	flag.Parse()

	slog.Info("starting basetalkking server...")

	// 加载配置
	if err := config.Load(*env); err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	cfg := config.Cfg

	// 生产环境校验 JWT Secret
	if cfg.Server.Mode == "release" && (cfg.JWT.Secret == "" || cfg.JWT.Secret == "change-me-in-production-256bit-minimum") {
		slog.Error("JWT_SECRET is not set or using default value — refusing to start in release mode")
		os.Exit(1)
	}

	// 初始化 MySQL
	if err := database.InitMySQL(cfg.Database.MySQL, cfg.Log.Level); err != nil {
		slog.Error("failed to init mysql", "error", err)
		os.Exit(1)
	}

	// 初始化 Redis
	if err := database.InitRedis(cfg.Redis); err != nil {
		slog.Error("failed to init redis", "error", err)
		os.Exit(1)
	}

	// 创建 Gin 引擎并注册路由
	r := router.Setup(cfg.Server.Mode)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// 启动 HTTP server（非阻塞）
	go func() {
		slog.Info("server listening", "addr", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	// 等待终止信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	slog.Info("received signal, shutting down gracefully...", "signal", sig.String())

	// 给 15 秒完成正在处理的请求
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("server forced to shutdown", "error", err)
	}

	// 关闭数据库和 Redis 连接
	database.Close()

	slog.Info("server exited")
}
