# Stage 1: Build
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o basetalkking ./cmd/basetalkking

# Stage 2: Minimal runtime
FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata wget
ENV TZ=Asia/Shanghai
WORKDIR /app
COPY --from=builder /app/basetalkking .
COPY --from=builder /app/configs ./configs
EXPOSE 8080
ENTRYPOINT ["./basetalkking", "-env", "prod"]
