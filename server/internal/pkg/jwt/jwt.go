package jwt

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	jwtv5 "github.com/golang-jwt/jwt/v5"
)

var (
	ErrTokenExpired   = errors.New("token已过期")
	ErrTokenInvalid   = errors.New("token无效")
	ErrTokenBlacklisted = errors.New("token已失效")
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwtv5.RegisteredClaims
}

// GenerateToken 生成 JWT Token
func GenerateToken(userID uint, role, secret string, expireHours int) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwtv5.RegisteredClaims{
			IssuedAt:  jwtv5.NewNumericDate(now),
			ExpiresAt: jwtv5.NewNumericDate(now.Add(time.Duration(expireHours) * time.Hour)),
		},
	}

	token := jwtv5.NewWithClaims(jwtv5.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken 解析 JWT Token
func ParseToken(tokenString, secret string) (*Claims, error) {
	token, err := jwtv5.ParseWithClaims(tokenString, &Claims{},
		func(token *jwtv5.Token) (any, error) {
			return []byte(secret), nil
		})

	if err != nil {
		if errors.Is(err, jwtv5.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrTokenInvalid
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrTokenInvalid
	}

	return claims, nil
}

// TokenHash 计算 token 的 SHA256 哈希，用于 Redis 黑名单 key
func TokenHash(tokenString string) string {
	h := sha256.Sum256([]byte(tokenString))
	return hex.EncodeToString(h[:])
}

