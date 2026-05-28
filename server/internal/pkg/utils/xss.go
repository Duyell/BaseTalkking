package utils

import "html"

// EscapeXSS 转义 HTML 特殊字符，防御 XSS 攻击
func EscapeXSS(input string) string {
	return html.EscapeString(input)
}
