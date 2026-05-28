package database

import "log/slog"

func Close() {
	slog.Info("closing database connections...")
	CloseMySQL()
	CloseRedis()
}
