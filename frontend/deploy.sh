#!/bin/bash

echo "🚀 QuantViz 快速部署工具"
echo "================================"
echo ""

# 检查当前目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误：请在 quantviz-updated 目录下运行此脚本"
    exit 1
fi

echo "选择部署方式："
echo "1. 本地预览（Python HTTP服务器）"
echo "2. 生成部署包（用于上传到云服务）"
echo "3. 查看部署指南"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 启动本地服务器..."
        echo "访问地址：http://localhost:8000"
        echo "按 Ctrl+C 停止服务"
        echo ""
        python3 -m http.server 8000
        ;;
    2)
        echo ""
        echo "📦 生成部署包..."
        zip -r quantviz-deploy.zip . -x "*.DS_Store" "deploy.sh" "*.md"
        echo "✅ 部署包已生成：quantviz-deploy.zip"
        echo ""
        echo "接下来："
        echo "1. 上传到 Vercel/Netlify/Render"
        echo "2. 或解压到服务器 Nginx 目录"
        ;;
    3)
        echo ""
        cat README.md
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
