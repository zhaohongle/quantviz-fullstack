#!/bin/bash

# ========== QuantViz 停止脚本 ==========

echo "🛑 停止 QuantViz 服务..."

# 停止后端（Node.js）
echo "📡 停止后端服务..."
pkill -f "node.*server.js"

# 停止前端（Python）
echo "🌐 停止前端服务..."
pkill -f "python.*http.server.*3000"

# 清理日志
if [ -f "backend.log" ]; then
    echo "🧹 清理日志文件..."
    rm backend.log
fi

echo ""
echo "✅ 服务已停止"
