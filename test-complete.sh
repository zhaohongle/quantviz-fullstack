#!/bin/bash
# QuantViz 完整功能测试脚本

echo "=========================================="
echo "QuantViz 完整功能测试"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3001"
PASSED=0
FAILED=0

# 测试函数
test_api() {
  local name="$1"
  local url="$2"
  local expected="$3"
  
  echo -n "测试: $name ... "
  
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "$expected"; then
    echo "✅ 通过"
    ((PASSED++))
  else
    echo "❌ 失败"
    echo "   URL: $url"
    echo "   响应: $response"
    ((FAILED++))
  fi
}

# P1 核心功能测试
echo "=== P1 核心功能测试 ==="
echo ""

test_api "1. 健康检查" "$BASE_URL/api/health" "\"status\":\"ok\""
test_api "2. AI推荐接口" "$BASE_URL/api/recommendations" "\"data\":"
test_api "3. 智能筛选策略" "$BASE_URL/api/filter/strategies" "\"data\":"
test_api "4. 搜索-股票代码" "$BASE_URL/api/search/suggestions?q=600519" "\"code\":\"600519\""
test_api "5. 搜索-拼音" "$BASE_URL/api/search/suggestions?q=gzmt" "\"code\":\"600519\""
test_api "6. 自选股列表" "$BASE_URL/api/watchlist" "\"success\":true"

echo ""
echo "=== API 端点测试完成 ==="
echo "通过: $PASSED"
echo "失败: $FAILED"
echo ""

# 前端测试提示
echo "=== 前端测试（需手动验证）==="
echo "1. 访问主应用: http://localhost:3000/app.html"
echo "2. 测试导航切换（首页、AI推荐、智能筛选、自选股、设置）"
echo "3. 测试搜索功能（全局搜索框）"
echo "4. 测试自选股添加/删除"
echo "5. 测试数据刷新（手动和自动）"
echo "6. 测试移动端（Chrome DevTools 模拟）"
echo ""

# 总结
if [ $FAILED -eq 0 ]; then
  echo "✅ 所有 API 测试通过！"
  exit 0
else
  echo "❌ 发现 $FAILED 个失败的测试"
  exit 1
fi
