// ========== API 连接测试脚本 ==========
// 验证真实数据连接是否正常

const apiClient = require('./api-client');
const dataFetcher = require('./data-fetcher');

async function testAPIs() {
  console.log('\n========== QuantViz API 连接测试 ==========\n');
  
  const results = {
    success: [],
    failed: []
  };
  
  // 1. 测试新浪财经 - 股票行情
  console.log('🔍 测试 1: 股票实时行情（新浪财经）');
  try {
    const stocks = await apiClient.fetchStockQuotes(['sh600519', 'sz000001']);
    if (stocks && stocks.length > 0) {
      console.log('✅ 成功! 获取到', stocks.length, '只股票');
      console.log('   示例数据:', {
        name: stocks[0].name,
        price: stocks[0].price,
        changePercent: stocks[0].changePercent + '%',
        time: stocks[0].time
      });
      results.success.push('股票行情');
    } else {
      throw new Error('未获取到数据');
    }
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.failed.push('股票行情');
  }
  
  console.log('');
  
  // 2. 测试新浪财经 - 指数数据
  console.log('🔍 测试 2: 指数数据（新浪财经）');
  try {
    const indices = await apiClient.fetchIndices();
    if (indices && indices.length > 0) {
      console.log('✅ 成功! 获取到', indices.length, '个指数');
      console.log('   示例数据:', {
        name: indices[0].name,
        value: indices[0].value,
        changePercent: indices[0].changePercent + '%'
      });
      results.success.push('指数数据');
    } else {
      throw new Error('未获取到数据');
    }
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.failed.push('指数数据');
  }
  
  console.log('');
  
  // 3. 测试东方财富 - 板块资金流
  console.log('🔍 测试 3: 板块资金流（东方财富）');
  try {
    const sectors = await apiClient.fetchSectorFundFlow();
    if (sectors && sectors.length > 0) {
      console.log('✅ 成功! 获取到', sectors.length, '个板块');
      console.log('   示例数据:', {
        name: sectors[0].name,
        changePercent: sectors[0].changePercent + '%',
        flow: sectors[0].flow + '亿'
      });
      results.success.push('板块资金流');
    } else {
      throw new Error('未获取到数据');
    }
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.log('⚠️  将使用股票数据聚合作为降级方案');
    results.failed.push('板块资金流（已降级）');
  }
  
  console.log('');
  
  // 4. 测试完整数据流
  console.log('🔍 测试 4: 完整数据流（data-fetcher）');
  try {
    const [indices, stocks, sectors, news, recommendations] = await Promise.all([
      dataFetcher.fetchIndices(),
      dataFetcher.fetchStocks(),
      dataFetcher.fetchSectors(),
      dataFetcher.generateNews(),
      dataFetcher.generateRecommendations()
    ]);
    
    console.log('✅ 成功! 完整数据流正常');
    console.log('   指数:', indices.length, '个');
    console.log('   股票:', stocks.length, '只');
    console.log('   板块:', sectors.length, '个');
    console.log('   新闻:', news.length, '条');
    console.log('   推荐:', recommendations.length, '只');
    
    results.success.push('完整数据流');
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.failed.push('完整数据流');
  }
  
  console.log('');
  
  // 5. 性能测试
  console.log('🔍 测试 5: 性能测试');
  try {
    const startTime = Date.now();
    await Promise.all([
      dataFetcher.fetchIndices(),
      dataFetcher.fetchStocks(),
      dataFetcher.fetchSectors()
    ]);
    const duration = Date.now() - startTime;
    
    console.log('✅ 成功! 并发请求耗时:', duration + 'ms');
    if (duration < 3000) {
      console.log('   性能: 优秀 ✨');
    } else if (duration < 5000) {
      console.log('   性能: 良好 👍');
    } else {
      console.log('   性能: 一般 ⚠️');
    }
    
    results.success.push('性能测试');
  } catch (error) {
    console.error('❌ 失败:', error.message);
    results.failed.push('性能测试');
  }
  
  // 汇总报告
  console.log('\n========== 测试报告 ==========\n');
  console.log('✅ 成功:', results.success.length, '项');
  results.success.forEach(item => console.log('   ✓', item));
  
  if (results.failed.length > 0) {
    console.log('\n❌ 失败:', results.failed.length, '项');
    results.failed.forEach(item => console.log('   ✗', item));
  }
  
  console.log('\n========================================\n');
  
  const successRate = (results.success.length / (results.success.length + results.failed.length) * 100).toFixed(0);
  
  if (results.failed.length === 0) {
    console.log('🎉 恭喜！所有测试通过！');
    console.log('✅ QuantViz 真实数据连接已成功配置！\n');
    return true;
  } else {
    console.log(`⚠️  部分测试失败（成功率: ${successRate}%）`);
    console.log('💡 建议检查网络连接和 API 可用性\n');
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testAPIs()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testAPIs };
