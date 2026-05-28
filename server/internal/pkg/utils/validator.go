package utils

import (
	"regexp"
	"unicode/utf8"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)
)

// ValidateUsername 校验用户名：3-20位字母数字下划线
func ValidateUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

// ValidatePassword 校验密码强度：8-128位，包含字母和数字
func ValidatePassword(password string) bool {
	length := utf8.RuneCountInString(password)
	if length < 8 || length > 128 {
		return false
	}
	hasLetter := false
	hasDigit := false
	for _, c := range password {
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') {
			hasLetter = true
		}
		if c >= '0' && c <= '9' {
			hasDigit = true
		}
	}
	return hasLetter && hasDigit
}

// ValidateInviteCode 校验邀请码格式：16位字母数字
func ValidateInviteCode(code string) bool {
	if len(code) != 16 {
		return false
	}
	for _, c := range code {
		if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
			return false
		}
	}
	return true
}
