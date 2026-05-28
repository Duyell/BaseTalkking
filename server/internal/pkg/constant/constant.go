package constant

// 用户角色
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

// 用户状态
const (
	UserStatusNormal int8 = 0
	UserStatusBanned int8 = 1
)

// Context Key
const (
	CtxUserID = "userID"
	CtxRole   = "role"
)
