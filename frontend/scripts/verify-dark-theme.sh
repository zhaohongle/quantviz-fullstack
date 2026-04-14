#!/bin/bash
# QuantViz UI 暗黑主题 - 快速验证脚本

echo "======================================"
echo "  QuantViz 暗黑主题验证工具"
echo "======================================"
echo ""

cd "$(dirname "$0")/.."

# 1. 检查主题文件
echo "📁 1. 检查主题文件..."
if [ -f "css/dark-theme.css" ]; then
  echo "   ✓ dark-theme.css 存在"
else
  echo "   ✗ dark-theme.css 缺失！"
  exit 1
fi
echo ""

# 2. 检查所有页面的主题引用
echo "🔗 2. 检查主题引用..."
pages=(
  "pages/prd3/recommendations-new.html"
  "pages/prd3/recommendation-detail.html"
  "pages/prd3/accuracy.html"
  "pages/filter/smart-filter.html"
  "pages/stocks/kline.html"
  "pages/watchlist/index.html"
  "pages/settings/index.html"
  "pages/search/index.html"
)

missing=0
for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    if grep -q "dark-theme.css" "$page"; then
      echo "   ✓ $(basename "$page")"
    else
      echo "   ✗ $(basename "$page") 缺少主题引用"
      missing=$((missing + 1))
    fi
  else
    echo "   ✗ $(basename "$page") 文件不存在"
    missing=$((missing + 1))
  fi
done
echo ""

# 3. 检查 CSS 变量使用
echo "🎨 3. CSS 变量使用统计..."
total_vars=0
for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    count=$(grep -c "var(--" "$page" 2>/dev/null || echo "0")
    total_vars=$((total_vars + count))
    if [ "$count" -gt 0 ]; then
      printf "   %-30s %3d 个变量\n" "$(basename "$page")" "$count"
    fi
  fi
done
echo "   ────────────────────────────────────"
printf "   %-30s %3d 个变量\n" "总计" "$total_vars"
echo ""

# 4. 检查备份文件
echo "💾 4. 检查备份文件..."
backup_count=$(find pages -name "*.backup" 2>/dev/null | wc -l)
echo "   发现 $backup_count 个备份文件"
echo ""

# 5. 最终结果
echo "======================================"
if [ $missing -eq 0 ]; then
  echo "   ✅ 所有检查通过！"
  echo "   🎉 暗黑主题已成功应用到所有页面"
else
  echo "   ⚠️  发现 $missing 个问题"
  echo "   请检查上述错误信息"
fi
echo "======================================"
echo ""

# 6. 快速启动本地服务器（可选）
echo "💡 提示: 要测试页面效果，可运行："
echo "   cd quantviz-fullstack/frontend"
echo "   python3 -m http.server 8080"
echo "   然后访问: http://localhost:8080/pages/prd3/recommendations-new.html"
