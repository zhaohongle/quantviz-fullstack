#!/bin/bash

# QuantViz 快速启动脚本
# 使用方法: ./deploy.sh [start|stop|restart|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
  start)
    echo "🚀 启动 QuantViz 服务..."
    echo ""
    
    # 启动后端
    echo "📦 启动后端服务 (PM2)..."
    cd "$SCRIPT_DIR" && pm2 start ecosystem.config.json
    echo ""
    
    # 启动前端
    echo "🌐 启动前端服务 (Nginx)..."
    brew services start nginx
    echo ""
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 3
    echo ""
    
    # 运行健康检查
    bash "$SCRIPT_DIR/health-check.sh"
    ;;
    
  stop)
    echo "🛑 停止 QuantViz 服务..."
    echo ""
    
    # 停止后端
    echo "📦 停止后端服务 (PM2)..."
    pm2 stop quantviz-backend
    echo ""
    
    # 停止前端
    echo "🌐 停止前端服务 (Nginx)..."
    brew services stop nginx
    echo ""
    
    echo "✅ 所有服务已停止"
    ;;
    
  restart)
    echo "🔄 重启 QuantViz 服务..."
    echo ""
    
    # 重启后端
    echo "📦 重启后端服务 (PM2)..."
    pm2 restart quantviz-backend
    echo ""
    
    # 重启前端
    echo "🌐 重启前端服务 (Nginx)..."
    brew services restart nginx
    echo ""
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 3
    echo ""
    
    # 运行健康检查
    bash "$SCRIPT_DIR/health-check.sh"
    ;;
    
  status)
    echo "📊 QuantViz 服务状态..."
    echo ""
    
    # 后端状态
    echo "📦 后端服务 (PM2):"
    pm2 status | grep quantviz-backend || echo "  ❌ 后端未运行"
    echo ""
    
    # 前端状态
    echo "🌐 前端服务 (Nginx):"
    brew services list | grep nginx || echo "  ❌ Nginx 未运行"
    echo ""
    
    # API 状态
    echo "🔌 API 状态:"
    health=$(curl -s http://localhost:3001/api/health)
    if echo "$health" | grep -q "ok"; then
      echo "  ✅ API 正常响应"
    else
      echo "  ❌ API 无响应"
    fi
    echo ""
    
    # 前端状态
    echo "🖥️  前端状态:"
    frontend_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/app.html)
    if [ "$frontend_code" == "200" ]; then
      echo "  ✅ 前端页面可访问"
    else
      echo "  ❌ 前端页面无法访问 (HTTP $frontend_code)"
    fi
    ;;
    
  *)
    echo "QuantViz 部署管理脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh start    - 启动所有服务"
    echo "  ./deploy.sh stop     - 停止所有服务"
    echo "  ./deploy.sh restart  - 重启所有服务"
    echo "  ./deploy.sh status   - 查看服务状态"
    echo ""
    echo "服务地址:"
    echo "  前端: http://localhost:8888/app.html"
    echo "  后端: http://localhost:3001/api/health"
    echo ""
    exit 1
    ;;
esac
