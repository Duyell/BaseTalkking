package config

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config 全局配置
type Config struct {
	Server     ServerConfig     `mapstructure:"server"`
	Database   DatabaseConfig   `mapstructure:"database"`
	Redis      RedisConfig      `mapstructure:"redis"`
	JWT        JWTConfig        `mapstructure:"jwt"`
	InviteCode InviteCodeConfig `mapstructure:"invite_code"`
	Log        LogConfig        `mapstructure:"log"`
	OpenAI     OpenAIConfig     `mapstructure:"openai"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	MySQL MySQLConfig `mapstructure:"mysql"`
}

type MySQLConfig struct {
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	User            string `mapstructure:"user"`
	Password        string `mapstructure:"password"`
	DBName          string `mapstructure:"dbname"`
	Charset         string `mapstructure:"charset"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime int    `mapstructure:"conn_max_lifetime"`
}

func (m MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		m.User, m.Password, m.Host, m.Port, m.DBName, m.Charset)
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

func (r RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

type JWTConfig struct {
	Secret      string `mapstructure:"secret"`
	ExpireHours int    `mapstructure:"expire_hours"`
}

type InviteCodeConfig struct {
	Length int `mapstructure:"length"`
}

type LogConfig struct {
	Level string `mapstructure:"level"`
	File  string `mapstructure:"file"`
}

type OpenAIConfig struct {
	APIKey         string  `mapstructure:"api_key"`
	BaseURL        string  `mapstructure:"base_url"`
	Model          string  `mapstructure:"model"`
	EmbeddingModel string  `mapstructure:"embedding_model"`
	MaxTokens      int     `mapstructure:"max_tokens"`
	Temperature    float64 `mapstructure:"temperature"`
	Timeout        int     `mapstructure:"timeout"`
}

var Cfg *Config

// Load 加载配置
func Load(env string) error {
	_ = godotenv.Load()

	viper.SetConfigName("config." + env)
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")

	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	Cfg = &Config{}
	if err := viper.Unmarshal(Cfg); err != nil {
		return fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// 环境变量覆盖
	if v := os.Getenv("DB_MYSQL_USER"); v != "" {
		Cfg.Database.MySQL.User = v
	}
	if v := os.Getenv("DB_MYSQL_HOST"); v != "" {
		Cfg.Database.MySQL.Host = v
	}
	if v := os.Getenv("DB_MYSQL_PASSWORD"); v != "" {
		Cfg.Database.MySQL.Password = v
	}
	if v := os.Getenv("REDIS_HOST"); v != "" {
		Cfg.Redis.Host = v
	}
	if v := os.Getenv("REDIS_PASSWORD"); v != "" {
		Cfg.Redis.Password = v
	}
	if v := os.Getenv("JWT_SECRET"); v != "" {
		Cfg.JWT.Secret = v
	}
	if v := os.Getenv("OPENAI_API_KEY"); v != "" {
		Cfg.OpenAI.APIKey = v
	}

	slog.Info("config loaded", "env", env)
	return nil
}
