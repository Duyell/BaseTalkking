#!/bin/bash
# 生成自签名 SSL 证书（仅用于测试环境）
# 生产环境请使用 Let's Encrypt 或购买的正规证书
openssl req -x509 -newkey rsa:4096 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -days 365 \
  -nodes \
  -subj '/CN=localhost'
echo "自签名证书已生成: fullchain.pem / privkey.pem"
