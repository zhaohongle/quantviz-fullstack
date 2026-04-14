#!/bin/bash

# QuantViz 服务健康检查脚本
# 使用方法: ./health-check.sh

echo "========================================="
echo "QuantViz 服务健康检查"
echo "========================================="
echo ""

# 检查后端服务（PM2）
echo "📦 [1/4] 检查后端服务 (PM2)..."
pm2_status=$(pm2 list | grep quantviz-backend | grep online)
if [ -n "$pm2_status" ]; then
    echo "✅ 后端服务运行正常"
    pm2 status | grep quantviz-backend
else
    echo "❌ 后端服务未运行"
    exit 1
fi
echo ""

# 检查前端服务（Nginx）
echo "🌐 [2/4] 检查前端服务 (Nginx)..."
nginx_status=$(ps aux | grep nginx | grep -v grep)
if [ -n "$nginx_status" ]; then
    echo "✅ Nginx 运行正常"
else
    echo "❌ Nginx 未运行"
    exit 1
fi
echo ""

# 检查后端 API
echo "🔌 [3/4] 检查后端 API..."
health_check=$(curl -s http://localhost:3001/api/health)
if echo "$health_check" | grep -q "ok"; then
    echo "✅ 后端 API 正常响应"
    echo "$health_check" | jq .
else
    echo "❌ 后端 API 无响应"
    exit 1
fi
echo ""

# 检查前端页面
echo "🖥️  [4/4] 检查前端页面..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/app.html)
if [ "$frontend_status" == "200" ]; then
    echo "✅ 前端页面可访问"
else
    echo "❌ 前端页面无法访问 (HTTP $frontend_status)"
    exit 1
fi
echo ""

# 检查完整 API 端点
echo "🧪 [Bonus] 检查主要 API 端点..."
echo "  - 指数数据: $(curl -s http://localhost:8888/api/indices | jq -r '.success')"
echo "  - 股票数据: $(curl -s http://localhost:8888/api/stocks | jq -r 'if .data then "true" else "false" end')"
echo "  - 新闻数据: $(curl -s http://localhost:8888/api/news | jq -r 'if .data then "true" else "false" end')"
echo ""

echo "========================================="
echo "✅ 所有服务运行正常！"
echo "========================================="
echo ""
echo "📊 服务地址:"
echo "  - 前端: http://localhost:8888/app.html"
echo "  - 后端: http://localhost:3001/api/health"
echo ""
echo "🔧 管理命令:"
echo "  - 查看后端日志: pm2 logs quantviz-backend"
echo "  - 重启后端: pm2 restart quantviz-backend"
echo "  - 重启前端: brew services restart nginx"
echo ""
