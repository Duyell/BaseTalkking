.PHONY: run build test lint clean docker-build docker-up docker-down deploy

# 本地运行
run:
	go run ./cmd/basetalkking -env dev

# 编译
build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/basetalkking ./cmd/basetalkking

# 交叉编译 Linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/basetalkking-linux ./cmd/basetalkking

# 运行测试
test:
	go test -race -cover ./internal/...

# 代码检查
lint:
	go vet ./...

# 清理
clean:
	rm -rf bin/

# Docker 构建后端镜像
docker-build:
	docker build -t basetalkking:latest -f deployments/Dockerfile .

# 本地开发基础设施
dev-infra-up:
	docker compose -f ../docker-compose.yml up -d

dev-infra-down:
	docker compose -f ../docker-compose.yml down

# 生产环境一键部署
deploy:
	cd ../client && npm run build
	docker compose -f ../docker-compose.prod.yml up -d --build

# 生产环境停止
deploy-down:
	docker compose -f ../docker-compose.prod.yml down
