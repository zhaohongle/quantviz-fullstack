#!/bin/bash

# QuantViz 数据刷新机制 - 快速验证脚本
# 用于快速检查刷新功能是否正确集成

echo "🔍 QuantViz 数据刷新机制 - 验证检查"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查文件是否存在
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2 - 文件不存在: $1"
        return 1
    fi
}

# 检查文件中是否包含特定内容
check_content() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✅${NC} $3"
        return 0
    else
        echo -e "${RED}❌${NC} $3 - 未找到: $2"
        return 1
    fi
}

pass_count=0
fail_count=0

echo "📁 核心文件检查"
echo "------------------------------------------"

# 检查刷新管理器
if check_file "frontend/js/refresh-manager.js" "刷新管理器文件"; then
    ((pass_count++))
else
    ((fail_count++))
fi

# 检查组件模板
if check_file "frontend/components/refresh-control.html" "刷新控制组件模板"; then
    ((pass_count++))
else
    ((fail_count++))
fi

# 检查文档
if check_file "docs/refresh-mechanism-guide.md" "功能说明文档"; then
    ((pass_count++))
else
    ((fail_count++))
fi

# 检查测试页面
if check_file "frontend/pages/test/refresh-test.html" "测试页面"; then
    ((pass_count++))
else
    ((fail_count++))
fi

echo ""
echo "📄 页面集成检查"
echo "------------------------------------------"

# 检查 AI 推荐页面
if check_file "frontend/pages/prd3/recommendations-new.html" "AI 推荐页面文件存在"; then
    ((pass_count++))
    if check_content "frontend/pages/prd3/recommendations-new.html" "refresh-manager.js" "AI 推荐页面已引入刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    if check_content "frontend/pages/prd3/recommendations-new.html" "RefreshManager.init" "AI 推荐页面已初始化刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
else
    ((fail_count++))
fi

# 检查智能筛选页面
if check_file "frontend/pages/filter/smart-filter.html" "智能筛选页面文件存在"; then
    ((pass_count++))
    if check_content "frontend/pages/filter/smart-filter.html" "refresh-manager.js" "智能筛选页面已引入刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    if check_content "frontend/pages/filter/smart-filter.html" "RefreshManager.init" "智能筛选页面已初始化刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
else
    ((fail_count++))
fi

# 检查自选股页面
if check_file "frontend/pages/watchlist/index.html" "自选股页面文件存在"; then
    ((pass_count++))
    if check_content "frontend/pages/watchlist/index.html" "refresh-manager.js" "自选股页面已引入刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    if check_content "frontend/pages/watchlist/index.html" "RefreshManager.init" "自选股页面已初始化刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    if check_content "frontend/pages/watchlist/index.html" "loadWatchlistPrices" "自选股页面已实现刷新函数"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
else
    ((fail_count++))
fi

# 检查全球指数页面
if check_file "frontend/pages/prd1/indices.html" "全球指数页面文件存在"; then
    ((pass_count++))
    if check_content "frontend/pages/prd1/indices.html" "refresh-manager.js" "全球指数页面已引入刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
    if check_content "frontend/pages/prd1/indices.html" "RefreshManager.init" "全球指数页面已初始化刷新管理器"; then
        ((pass_count++))
    else
        ((fail_count++))
    fi
else
    ((fail_count++))
fi

echo ""
echo "📊 验证结果"
echo "=========================================="
echo -e "通过: ${GREEN}${pass_count}${NC}"
echo -e "失败: ${RED}${fail_count}${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！数据刷新机制已成功集成。${NC}"
    echo ""
    echo "📖 下一步："
    echo "1. 启动本地服务器（如 Live Server）"
    echo "2. 访问测试页面: frontend/pages/test/refresh-test.html"
    echo "3. 测试各项刷新功能"
    echo "4. 查看文档: docs/refresh-mechanism-guide.md"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 ${fail_count} 项检查失败，请检查上述错误。${NC}"
    exit 1
fi
