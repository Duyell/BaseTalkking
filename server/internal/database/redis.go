package database

import (
	"context"
	"log/slog"
	"time"

	"basetalkking/internal/config"

	"github.com/go-redis/redis/v8"
)

var RDB *redis.Client

func InitRedis(cfg config.RedisConfig) error {
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := RDB.Ping(ctx).Err(); err != nil {
		return err
	}

	slog.Info("redis connected", "host", cfg.Host, "port", cfg.Port)
	return nil
}

func CloseRedis() {
	if RDB != nil {
		RDB.Close()
	}
}
