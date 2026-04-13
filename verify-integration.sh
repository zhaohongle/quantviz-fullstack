#!/bin/bash

# ========== QuantViz API 集成验证脚本 ==========

echo "🔍 QuantViz API 集成验证开始..."
echo ""

# 检查目录结构
echo "📁 检查文件结构..."
check_file() {
    if [ -f "$1" ]; then
        echo "  ✅ $1"
    else
        echo "  ❌ 缺失: $1"
        return 1
    fi
}

# 检查核心文件
check_file "frontend/js/api-integration.js"
check_file "frontend/index-new.html"
check_file "frontend/index-new-api.js"

# PRD-1
check_file "frontend/pages/prd1/indices.html"
check_file "frontend/pages/prd1/index-detail.html"
check_file "frontend/pages/prd1/index-detail-api.js"
check_file "frontend/pages/prd1/news-detail.html"
check_file "frontend/pages/prd1/news-detail-api.js"

# PRD-2
check_file "frontend/pages/prd2/sectors.html"
check_file "frontend/pages/prd2/sectors-api.js"
check_file "frontend/pages/prd2/sector-detail.html"
check_file "frontend/pages/prd2/sector-detail-api.js"
check_file "frontend/pages/prd2/bubble-chart.html"
check_file "frontend/pages/prd2/bubble-chart-api.js"

# PRD-3
check_file "frontend/pages/prd3/recommendations.html"
check_file "frontend/pages/prd3/recommendations-api.js"
check_file "frontend/pages/prd3/detail.html"
check_file "frontend/pages/prd3/detail-api.js"
check_file "frontend/pages/prd3/accuracy.html"
check_file "frontend/pages/prd3/accuracy-api.js"
check_file "frontend/pages/prd3/history.html"
check_file "frontend/pages/prd3/history-api.js"

echo ""
echo "📊 检查 API 集成脚本注入..."

# 检查是否正确注入了 API 脚本
check_script_injection() {
    local file=$1
    local script=$2
    
    if grep -q "$script" "$file"; then
        echo "  ✅ $file 已注入 $script"
    else
        echo "  ⚠️  $file 未注入 $script"
    fi
}

check_script_injection "frontend/index-new.html" "index-new-api.js"
check_script_injection "frontend/pages/prd1/index-detail.html" "index-detail-api.js"
check_script_injection "frontend/pages/prd1/news-detail.html" "news-detail-api.js"
check_script_injection "frontend/pages/prd2/sectors.html" "sectors-api.js"
check_script_injection "frontend/pages/prd2/sector-detail.html" "sector-detail-api.js"
check_script_injection "frontend/pages/prd2/bubble-chart.html" "bubble-chart-api.js"
check_script_injection "frontend/pages/prd3/recommendations.html" "recommendations-api.js"
check_script_injection "frontend/pages/prd3/detail.html" "detail-api.js"
check_script_injection "frontend/pages/prd3/accuracy.html" "accuracy-api.js"
check_script_injection "frontend/pages/prd3/history.html" "history-api.js"

echo ""
echo "🔧 检查后端服务..."

# 检查后端是否运行
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "  ✅ 后端服务运行中 (http://localhost:3001)"
    
    # 测试各个 API 端点
    echo ""
    echo "  📡 测试 API 端点..."
    
    test_endpoint() {
        local endpoint=$1
        local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001$endpoint" 2>/dev/null)
        
        if [ "$response" = "200" ]; then
            echo "    ✅ $endpoint"
        else
            echo "    ⚠️  $endpoint (HTTP $response)"
        fi
    }
    
    test_endpoint "/api/health"
    test_endpoint "/api/data"
    test_endpoint "/api/indices"
    test_endpoint "/api/stocks"
    test_endpoint "/api/sectors"
    test_endpoint "/api/news"
    test_endpoint "/api/recommendations"
    test_endpoint "/api/ranking"
    
else
    echo "  ⚠️  后端服务未运行"
    echo "  💡 启动命令: cd backend && npm start"
fi

echo ""
echo "📋 项目统计..."

# 统计代码行数
total_js_lines=$(find frontend -name "*-api.js" -o -name "api-integration.js" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "  • JavaScript 代码行数: $total_js_lines"

# 统计文件数
api_scripts=$(find frontend -name "*-api.js" | wc -l | tr -d ' ')
echo "  • API 集成脚本数: $api_scripts"

html_pages=$(find frontend/pages -name "*.html" | wc -l | tr -d ' ')
echo "  • HTML 页面数: $html_pages"

echo ""
echo "✅ 验证完成！"
echo ""
echo "🚀 下一步:"
echo "  1. 启动后端: cd backend && npm start"
echo "  2. 访问主页: http://localhost:3000/index-new.html"
echo "  3. 测试所有页面链接"
echo ""
