package e

import "fmt"

// BizError 自定义业务错误
type BizError struct {
	Code    int
	Message string
	Err     error
}

func New(code int, message string) *BizError {
	return &BizError{Code: code, Message: message}
}

func (e *BizError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *BizError) Unwrap() error {
	return e.Err
}

// Wrap 包装底层错误
func Wrap(code int, message string, err error) *BizError {
	return &BizError{Code: code, Message: message, Err: err}
}
