package database

import (
	"log/slog"
	"time"

	"basetalkking/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitMySQL(cfg config.MySQLConfig, logLevel string) error {
	var err error
	gormLogLevel := logger.Warn
	if logLevel == "debug" {
		gormLogLevel = logger.Info
	}
	DB, err = gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel),
	})
	if err != nil {
		return err
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Duration(cfg.ConnMaxLifetime) * time.Second)

	if err := sqlDB.Ping(); err != nil {
		return err
	}

	slog.Info("mysql connected", "host", cfg.Host, "port", cfg.Port, "db", cfg.DBName)
	return nil
}

func CloseMySQL() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}
