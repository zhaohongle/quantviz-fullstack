// ========== QuantViz Backend API Server ==========
// 提供实时股票数据API，自动定时更新

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dataFetcher = require('./data-fetcher');
const recommendationEngine = require('./recommendation-engine');
const filterEngine = require('./filter-engine');

// 引入路由模块
const indicesRouter = require('./routes/indices');
const watchlistRouter = require('./routes/watchlist');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/indices', indicesRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/search', searchRouter);

// 数据缓存
let cachedData = {
  indices: null,
  globalIndices: null, // 新增：全球指数
  stocks: null,
  sectors: null,
  news: null,
  recommendations: null,
  ranking: null,
  lastUpdate: null
};

// 共享缓存数据到 app.locals（供路由访问）
app.locals.cachedData = cachedData;

// ========== API 路由 ==========

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lastUpdate: cachedData.lastUpdate,
    uptime: process.uptime()
  });
});

// 获取所有数据（一次性）
app.get('/api/data', (req, res) => {
  if (!cachedData.indices) {
    return res.status(503).json({ error: '数据加载中，请稍后重试' });
  }
  
  res.json({
    indices: cachedData.indices,
    stocks: cachedData.stocks,
    sectors: cachedData.sectors,
    news: cachedData.news,
    recommendations: cachedData.recommendations,
    ranking: cachedData.ranking,
    lastUpdate: cachedData.lastUpdate,
    updateTime: new Date(cachedData.lastUpdate).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  });
});

// 获取首页数据（全球指数 + 股市资讯）
app.get('/api/home/data', (req, res) => {
  if (!cachedData.globalIndices) {
    return res.status(503).json({ error: '数据加载中，请稍后重试' });
  }
  
  res.json({
    indices: cachedData.globalIndices,
    news: (cachedData.news || []).slice(0, 20), // 只返回前 20 条新闻
    lastUpdate: cachedData.lastUpdate,
    updateTime: new Date(cachedData.lastUpdate).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  });
});

// 获取指数数据（简化版，详细功能由 /api/indices 路由处理）
// app.get('/api/indices', (req, res) => {
//   if (!cachedData.indices) {
//     return res.status(503).json({ error: '数据加载中' });
//   }
//   res.json({
//     data: cachedData.indices,
//     lastUpdate: cachedData.lastUpdate
//   });
// });

// 获取股票数据
app.get('/api/stocks', (req, res) => {
  const { codes } = req.query;
  let stocks = cachedData.stocks || [];
  
  if (codes) {
    const codeList = codes.split(',');
    stocks = stocks.filter(s => codeList.includes(s.code));
  }
  
  res.json({
    data: stocks,
    count: stocks.length,
    lastUpdate: cachedData.lastUpdate
  });
});

// 获取板块数据
app.get('/api/sectors', (req, res) => {
  res.json({
    data: cachedData.sectors || [],
    lastUpdate: cachedData.lastUpdate
  });
});

// 获取新闻
app.get('/api/news', (req, res) => {
  res.json({
    data: cachedData.news || [],
    lastUpdate: cachedData.lastUpdate
  });
});

// 获取推荐（增强版，支持风险偏好筛选）
app.get('/api/recommendations', async (req, res) => {
  const { risk } = req.query; // low, medium, high
  
  try {
    // 如果请求了风险偏好筛选，动态生成推荐
    if (risk && ['low', 'medium', 'high'].includes(risk)) {
      const recommendations = await recommendationEngine.generateEnhancedRecommendations(risk);
      return res.json({
        data: recommendations,
        riskLevel: risk,
        lastUpdate: Date.now()
      });
    }
    
    // 否则返回缓存的推荐
    res.json({
      data: cachedData.recommendations || [],
      lastUpdate: cachedData.lastUpdate
    });
  } catch (error) {
    console.error('获取推荐失败:', error);
    res.status(500).json({ error: '获取推荐失败' });
  }
});

// 获取推荐详情（包含完整理由和风险）
app.get('/api/recommendations/detailed/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // 从缓存或动态生成推荐
    let recommendations = cachedData.recommendations;
    if (!recommendations || recommendations.length === 0) {
      recommendations = await recommendationEngine.generateEnhancedRecommendations();
    }
    
    // 查找指定股票
    const recommendation = recommendations.find(r => r.code === code);
    
    if (!recommendation) {
      return res.status(404).json({ error: '未找到该推荐' });
    }
    
    res.json({
      data: recommendation,
      lastUpdate: cachedData.lastUpdate
    });
  } catch (error) {
    console.error('获取推荐详情失败:', error);
    res.status(500).json({ error: '获取推荐详情失败' });
  }
});

// 获取历史准确率统计
app.get('/api/recommendations/accuracy', (req, res) => {
  try {
    const stats = recommendationEngine.generateAccuracyStats();
    res.json({
      data: stats,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('获取准确率失败:', error);
    res.status(500).json({ error: '获取准确率失败' });
  }
});

// 获取排行榜
app.get('/api/ranking', (req, res) => {
  res.json({
    data: cachedData.ranking || { gainers: [], losers: [] },
    lastUpdate: cachedData.lastUpdate
  });
});

// 手动触发数据更新（用于测试）
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 手动触发数据更新...');
    await updateData();
    res.json({
      success: true,
      message: '数据更新成功',
      lastUpdate: cachedData.lastUpdate
    });
  } catch (error) {
    console.error('❌ 手动更新失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 智能筛选 API ==========

// 获取所有预设策略（含匹配数量）
app.get('/api/filter/strategies', async (req, res) => {
  try {
    const strategies = await filterEngine.getAllStrategiesWithCount();
    res.json({
      data: strategies,
      count: strategies.length,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('获取策略列表失败:', error);
    res.status(500).json({ error: '获取策略列表失败' });
  }
});

// 应用预设策略
app.get('/api/filter/strategy/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const result = await filterEngine.applyStrategy(strategyId);
    res.json(result);
  } catch (error) {
    console.error('应用策略失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 自定义筛选（支持所有维度）
app.get('/api/filter/stocks', async (req, res) => {
  try {
    // 解析查询参数
    const filters = {};
    
    // 行业与板块
    if (req.query.industry) {
      filters.industry = req.query.industry.split(',');
    }
    if (req.query.sectors) {
      filters.sectors = req.query.sectors.split(',');
    }
    
    // 市值
    if (req.query.minMarketCap) {
      filters.minMarketCap = parseFloat(req.query.minMarketCap);
    }
    if (req.query.maxMarketCap) {
      filters.maxMarketCap = parseFloat(req.query.maxMarketCap);
    }
    
    // 财务指标
    if (req.query.minRevenueGrowth) {
      filters.minRevenueGrowth = parseFloat(req.query.minRevenueGrowth);
    }
    if (req.query.minNetProfitMargin) {
      filters.minNetProfitMargin = parseFloat(req.query.minNetProfitMargin);
    }
    if (req.query.minROE) {
      filters.minROE = parseFloat(req.query.minROE);
    }
    
    // 涨跌幅
    if (req.query.minChangePercent) {
      filters.minChangePercent = parseFloat(req.query.minChangePercent);
    }
    if (req.query.maxChangePercent) {
      filters.maxChangePercent = parseFloat(req.query.maxChangePercent);
    }
    if (req.query.maxChangePercent30d) {
      filters.maxChangePercent30d = parseFloat(req.query.maxChangePercent30d);
    }
    
    // AI 评分
    if (req.query.minScore) {
      filters.minScore = parseFloat(req.query.minScore);
    }
    
    // 风险等级
    if (req.query.riskLevel) {
      filters.riskLevel = req.query.riskLevel.split(',');
    }
    
    // 技术信号
    if (req.query.technicalSignal) {
      filters.technicalSignal = req.query.technicalSignal.split(',');
    }
    
    // 资金流向
    if (req.query.fundFlow) {
      filters.fundFlow = req.query.fundFlow;
    }
    
    // 成交量
    if (req.query.volumeRatio) {
      filters.volumeRatio = parseFloat(req.query.volumeRatio);
    }
    
    // 股息率
    if (req.query.minDividendYield) {
      filters.minDividendYield = parseFloat(req.query.minDividendYield);
    }
    if (req.query.consecutiveDividend) {
      filters.consecutiveDividend = parseInt(req.query.consecutiveDividend);
    }
    
    // 排序方式
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy;
    }
    
    // 执行筛选
    const results = await filterEngine.filterStocks(filters);
    
    res.json({
      filters,
      results,
      count: results.length,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('筛选股票失败:', error);
    res.status(500).json({ error: '筛选股票失败' });
  }
});

// 获取所有可用筛选维度
app.get('/api/filter/dimensions', (req, res) => {
  try {
    res.json({
      data: filterEngine.FILTER_DIMENSIONS,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('获取筛选维度失败:', error);
    res.status(500).json({ error: '获取筛选维度失败' });
  }
});

// ========== 数据更新函数 ==========
async function updateData() {
  try {
    console.log('⏰ 开始更新数据...');
    const startTime = Date.now();
    
    // 抓取所有数据
    const [indices, globalIndices, stocks, sectors, news, ranking] = await Promise.all([
      dataFetcher.fetchIndices(),
      dataFetcher.fetchGlobalIndices(), // 新增：全球指数
      dataFetcher.fetchStocks(),
      dataFetcher.fetchSectors(),
      dataFetcher.generateNews(),
      dataFetcher.generateRanking()
    ]);
    
    // 使用增强版推荐引擎
    const recommendations = await recommendationEngine.generateEnhancedRecommendations('medium');
    
    // 更新缓存
    cachedData = {
      indices,
      globalIndices, // 新增
      stocks,
      sectors,
      news,
      recommendations,
      ranking,
      lastUpdate: Date.now()
    };
    
    // 同步到 app.locals
    app.locals.cachedData = cachedData;
    
    const duration = Date.now() - startTime;
    console.log(`✅ 数据更新成功！耗时: ${duration}ms`);
    console.log(`   指数: ${indices.length}个`);
    console.log(`   全球指数: ${globalIndices.length}个`);
    console.log(`   股票: ${stocks.length}只`);
    console.log(`   新闻: ${news.length}条`);
    
  } catch (error) {
    console.error('❌ 数据更新失败:', error.message);
  }
}

// ========== 定时任务 ==========
function setupScheduler() {
  // 交易时间（周一到周五 9:30-15:00）每5分钟更新一次
  cron.schedule('*/5 9-15 * * 1-5', async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 只在9:30-15:00之间更新
    if ((hours === 9 && minutes >= 30) || (hours >= 10 && hours < 15) || (hours === 15 && minutes === 0)) {
      console.log(`\n[${new Date().toLocaleString('zh-CN')}] 交易时间自动更新`);
      await updateData();
    }
  }, {
    timezone: 'Asia/Shanghai'
  });
  
  // 非交易时间每30分钟更新一次
  cron.schedule('*/30 * * * *', async () => {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    
    // 周末或非交易时间
    if (day === 0 || day === 6 || hours < 9 || hours >= 15) {
      console.log(`\n[${new Date().toLocaleString('zh-CN')}] 非交易时间自动更新`);
      await updateData();
    }
  }, {
    timezone: 'Asia/Shanghai'
  });
  
  console.log('⏰ 定时任务已启动');
  console.log('   交易时间（周一至五 9:30-15:00）：每5分钟更新');
  console.log('   非交易时间：每30分钟更新');
}

// ========== 启动服务器 ==========
async function startServer() {
  try {
    // 首次启动立即更新数据
    console.log('🚀 服务器启动中...');
    await updateData();
    
    // 启动定时任务
    setupScheduler();
    
    // 启动HTTP服务
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n✅ QuantViz API Server 已启动！');
      console.log(`   地址: http://localhost:${PORT}`);
      console.log(`   健康检查: http://localhost:${PORT}/api/health`);
      console.log(`   数据接口: http://localhost:${PORT}/api/data`);
      console.log(`   手动刷新: POST http://localhost:${PORT}/api/refresh`);
      console.log('\n按 Ctrl+C 停止服务\n');
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅退出
process.on('SIGTERM', () => {
  console.log('\n👋 收到退出信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 收到退出信号，正在关闭服务器...');
  process.exit(0);
});

// 启动
startServer();
