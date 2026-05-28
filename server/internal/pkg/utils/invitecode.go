package utils

import (
	"crypto/rand"
	"math/big"
)

const defaultCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

// GenerateInviteCode 生成指定长度的随机邀请码（crypto/rand 安全随机）
func GenerateInviteCode(length int) (string, error) {
	if length <= 0 {
		length = 16
	}
	charsetLen := big.NewInt(int64(len(defaultCharset)))
	bytes := make([]byte, length)

	for i := range bytes {
		n, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		bytes[i] = defaultCharset[n.Int64()]
	}

	return string(bytes), nil
}
