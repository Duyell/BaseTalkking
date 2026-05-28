package errcode

// 成功
const CodeSuccess = 200

// 参数错误 (1000-1999)
const (
	CodeParamInvalid    = 1000
	CodeParamMissing    = 1001
	CodePasswordWeak    = 1002
	CodeUsernameInvalid = 1003
)

// 认证授权 (2000-2999)
const (
	CodeUnauthorized = 2000
	CodeTokenExpired = 2001
	CodeTokenInvalid = 2002
	CodeForbidden    = 2003
	CodeUserBanned   = 2004
)

// 业务错误 (3000-3999)
const (
	CodeUserExists      = 3000
	CodeUserNotFound    = 3001
	CodePasswordWrong   = 3002
	CodeInviteInvalid   = 3003
	CodeInviteUsed      = 3004
	CodeInviteExpired   = 3005
	CodeInviteDisabled  = 3006
	CodePostNotFound    = 3007
	CodeCommentNotFound = 3008
	CodeNotPostOwner    = 3009
	CodeNotCommentOwner = 3010
	CodeSelfLike        = 3011
)

// 系统错误 (4000-4999)
const (
	CodeInternalError = 4000
	CodeDatabaseError = 4001
	CodeRedisError    = 4002
	CodeRateLimited   = 4003
)

// AI 相关错误 (5000-5099)
const (
	CodeAIModelError      = 5000
	CodeAISessionNotFound = 5001
	CodeAIQuotaExceeded   = 5002
	CodeAIStreamError     = 5003
	CodeAINotOwner        = 5004
)
