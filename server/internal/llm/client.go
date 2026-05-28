package llm

import (
	"context"
	"fmt"

	"basetalkking/internal/config"

	openai "github.com/sashabaranov/go-openai"
)

type Client struct {
	client *openai.Client
	cfg    config.OpenAIConfig
}

func NewClient(cfg config.OpenAIConfig) *Client {
	c := openai.DefaultConfig(cfg.APIKey)
	if cfg.BaseURL != "" {
		c.BaseURL = cfg.BaseURL
	}
	return &Client{client: openai.NewClientWithConfig(c), cfg: cfg}
}

func (c *Client) ChatCompleteStream(ctx context.Context, messages []openai.ChatCompletionMessage) <-chan StreamChunk {
	out := make(chan StreamChunk)

	go func() {
		defer close(out)

		req := openai.ChatCompletionRequest{
			Model:       c.cfg.Model,
			Messages:    messages,
			MaxTokens:   c.cfg.MaxTokens,
			Temperature: float32(c.cfg.Temperature),
			Stream:      true,
		}

		stream, err := c.client.CreateChatCompletionStream(ctx, req)
		if err != nil {
			out <- StreamChunk{Error: fmt.Sprintf("LLM调用失败: %v", err), Done: true}
			return
		}
		defer stream.Close()

		for {
			response, err := stream.Recv()
			if err != nil {
				if ctx.Err() != nil {
					out <- StreamChunk{Error: "请求已取消", Done: true}
				}
				return
			}

			if len(response.Choices) > 0 {
				delta := response.Choices[0].Delta.Content
				if delta != "" {
					out <- StreamChunk{Content: delta}
				}
			}
		}
	}()

	return out
}
