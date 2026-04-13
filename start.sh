#!/bin/bash

# ========== QuantViz 快速启动脚本 ==========

echo "🚀 QuantViz 智能交易平台 - 快速启动"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装："
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 启动后端
echo "📡 启动后端 API 服务..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
fi

# 后台启动后端
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "   日志文件: backend.log"
echo "   API 地址: http://localhost:3001"
echo ""

# 等待后端启动
sleep 3

# 测试后端健康状态
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 后端健康检查通过"
else
    echo "⚠️  后端可能未完全启动，请稍等片刻"
fi

echo ""

# 启动前端
cd ../frontend
echo "🌐 启动前端服务..."

# 检查 Python
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 启动前端服务"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 启动完成！"
    echo ""
    echo "📱 访问地址："
    echo "   主应用: http://localhost:3000/app.html"
    echo "   旧导航: http://localhost:3000/index-new.html"
    echo ""
    echo "🔧 管理命令："
    echo "   停止服务: ./stop.sh"
    echo "   查看日志: tail -f backend.log"
    echo ""
    echo "按 Ctrl+C 停止前端服务"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    python3 -m http.server 3000
else
    echo "⚠️  未检测到 Python3"
    echo "💡 手动启动前端："
    echo "   cd frontend"
    echo "   npx http-server -p 3000"
    echo ""
    echo "或使用 VS Code Live Server"
fi
