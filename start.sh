#!/bin/bash

echo "🚀 QuantViz 完整版 - 快速启动"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装: https://nodejs.org"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo ""
echo "✅ 准备完成！"
echo ""
echo "选择启动方式："
echo "1. 完整启动（后端 + 前端）"
echo "2. 仅启动后端API"
echo "3. 仅启动前端"
echo "4. 测试后端API"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动完整服务..."
        echo ""
        echo "后端API: http://localhost:3000"
        echo "前端页面: http://localhost:8080"
        echo ""
        echo "按 Ctrl+C 停止服务"
        echo ""
        
        # 启动后端（后台）
        cd backend
        node server.js &
        BACKEND_PID=$!
        cd ..
        
        # 等待后端启动
        sleep 3
        
        # 启动前端
        cd frontend
        python3 -m http.server 8080 &
        FRONTEND_PID=$!
        cd ..
        
        echo ""
        echo "✅ 服务已启动！"
        echo "   后端PID: $BACKEND_PID"
        echo "   前端PID: $FRONTEND_PID"
        echo ""
        echo "🌐 请访问: http://localhost:8080"
        echo ""
        
        # 等待用户终止
        wait
        ;;
        
    2)
        echo ""
        echo "🚀 启动后端API..."
        cd backend
        node server.js
        ;;
        
    3)
        echo ""
        echo "🚀 启动前端..."
        echo "访问地址: http://localhost:8080"
        cd frontend
        python3 -m http.server 8080
        ;;
        
    4)
        echo ""
        echo "🧪 测试后端API..."
        cd backend
        node server.js &
        BACKEND_PID=$!
        
        echo "等待后端启动..."
        sleep 5
        
        echo ""
        echo "健康检查:"
        curl -s http://localhost:3000/api/health | python3 -m json.tool
        
        echo ""
        echo ""
        echo "获取数据:"
        curl -s http://localhost:3000/api/data | python3 -m json.tool | head -50
        
        echo ""
        echo ""
        echo "测试完成！停止后端..."
        kill $BACKEND_PID
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
