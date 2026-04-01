// ========== QuantViz Backend API Server ==========
// 提供实时股票数据API，自动定时更新

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dataFetcher = require('./data-fetcher');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据缓存
let cachedData = {
  indices: null,
  stocks: null,
  sectors: null,
  news: null,
  recommendations: null,
  ranking: null,
  lastUpdate: null
};

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

// 获取指数数据
app.get('/api/indices', (req, res) => {
  if (!cachedData.indices) {
    return res.status(503).json({ error: '数据加载中' });
  }
  res.json({
    data: cachedData.indices,
    lastUpdate: cachedData.lastUpdate
  });
});

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

// 获取推荐
app.get('/api/recommendations', (req, res) => {
  res.json({
    data: cachedData.recommendations || [],
    lastUpdate: cachedData.lastUpdate
  });
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

// ========== 数据更新函数 ==========
async function updateData() {
  try {
    console.log('⏰ 开始更新数据...');
    const startTime = Date.now();
    
    // 抓取所有数据
    const [indices, stocks, sectors, news, recommendations, ranking] = await Promise.all([
      dataFetcher.fetchIndices(),
      dataFetcher.fetchStocks(),
      dataFetcher.fetchSectors(),
      dataFetcher.generateNews(),
      dataFetcher.generateRecommendations(),
      dataFetcher.generateRanking()
    ]);
    
    // 更新缓存
    cachedData = {
      indices,
      stocks,
      sectors,
      news,
      recommendations,
      ranking,
      lastUpdate: Date.now()
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ 数据更新成功！耗时: ${duration}ms`);
    console.log(`   指数: ${indices.length}个`);
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
