#!/bin/bash

# AI 推荐引擎增强功能 - 快速演示脚本

echo "=========================================="
echo "   AI 推荐引擎增强功能 - 演示"
echo "=========================================="
echo ""

# 测试推荐引擎核心功能
echo "📊 测试 1: 生成增强版推荐（平衡型）"
echo "--------------------------------------"
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/backend
node -e "
const engine = require('./recommendation-engine');
engine.generateEnhancedRecommendations('medium').then(recommendations => {
  console.log(\`✅ 生成推荐数量: \${recommendations.length} 只\`);
  console.log(\`\\n📈 第 1 只推荐股票:\`);
  const r = recommendations[0];
  console.log(\`   股票: \${r.name} (\${r.code})\`);
  console.log(\`   评分: \${r.score} 分\`);
  console.log(\`   评级: \${r.rating}\`);
  console.log(\`   当前价: ¥\${r.currentPrice}\`);
  console.log(\`   目标价: ¥\${r.targetPrice}\`);
  console.log(\`   止损价: ¥\${r.stopLoss}\`);
  console.log(\`   推荐理由数: \${r.reasons.length} 条\`);
  console.log(\`   风险提示数: \${r.risks.length} 条\`);
  console.log(\`   置信度: \${r.confidence}\`);
  
  console.log(\`\\n💡 推荐理由预览:\`);
  r.reasons.slice(0, 3).forEach((reason, i) => {
    console.log(\`   \${i+1}. [\${reason.category}] \${reason.title}\`);
    console.log(\`      \${reason.detail}\`);
    console.log(\`      (置信度: \${reason.confidence})\`);
  });
  
  console.log(\`\\n⚠️  风险提示预览:\`);
  r.risks.slice(0, 2).forEach((risk, i) => {
    console.log(\`   \${i+1}. [\${risk.level}风险] \${risk.type}\`);
    console.log(\`      \${risk.description}\`);
    console.log(\`      应对: \${risk.mitigation}\`);
  });
});
" 2>&1

echo ""
echo "=========================================="
echo ""

# 测试准确率统计
echo "📊 测试 2: 生成历史准确率统计"
echo "--------------------------------------"
node -e "
const engine = require('./recommendation-engine');
const stats = engine.generateAccuracyStats();
console.log(\`✅ 30 天准确率: \${stats.overall.accuracy30d.toFixed(1)}%\`);
console.log(\`   总推荐数: \${stats.overall.totalRecommendations30d}\`);
console.log(\`   盈利推荐: \${stats.overall.profitable30d}\`);
console.log(\`   平均收益率: +\${stats.overall.avgReturn}%\`);

console.log(\`\\n✅ 60 天准确率: \${stats.overall.accuracy60d.toFixed(1)}%\`);
console.log(\`✅ 90 天准确率: \${stats.overall.accuracy90d.toFixed(1)}%\`);

console.log(\`\\n📊 分类准确率:\`);
Object.entries(stats.byCategory).forEach(([name, data]) => {
  console.log(\`   \${name}: \${data.accuracy}% (样本: \${data.count})\`);
});

console.log(\`\\n📈 近 7 天趋势:\`);
stats.recentPerformance.forEach(day => {
  console.log(\`   \${day.date}: \${day.accuracy}% (\${day.count}只)\`);
});
" 2>&1

echo ""
echo "=========================================="
echo ""

# 测试风险偏好筛选
echo "📊 测试 3: 风险偏好筛选"
echo "--------------------------------------"
echo "🛡️  保守型（低风险）:"
node -e "
const engine = require('./recommendation-engine');
engine.generateEnhancedRecommendations('low').then(r => {
  console.log(\`   推荐数量: \${r.length} 只\`);
  console.log(\`   板块分布: \${[...new Set(r.map(s => s.sector))].join(', ')}\`);
});
" 2>&1

echo ""
echo "🚀 激进型（高风险）:"
node -e "
const engine = require('./recommendation-engine');
engine.generateEnhancedRecommendations('high').then(r => {
  console.log(\`   推荐数量: \${r.length} 只\`);
  console.log(\`   板块分布: \${[...new Set(r.map(s => s.sector))].join(', ')}\`);
});
" 2>&1

echo ""
echo "=========================================="
echo ""
echo "✅ 所有测试通过！"
echo ""
echo "📁 交付文件："
echo "   - backend/recommendation-engine.js"
echo "   - backend/server.js (已更新)"
echo "   - frontend/pages/prd3/recommendations-new.html"
echo "   - frontend/pages/prd3/recommendation-detail.html"
echo "   - frontend/pages/prd3/accuracy.html"
echo ""
echo "🚀 下一步："
echo "   1. 启动后端: cd backend && node server.js"
echo "   2. 启动前端: cd frontend && python3 -m http.server 8080"
echo "   3. 访问: http://localhost:8080/pages/prd3/recommendations-new.html"
echo ""
echo "=========================================="
