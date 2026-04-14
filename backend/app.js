// ========================================
// QuantViz Backend API Server V2
// 提供实时股票数据API，支持数据库持久化
// ========================================

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

// 配置和中间件
const db = require('./config/database');
const { requestLogger, performanceMonitor } = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 路由
const indicesRouter = require('./routes/indices');
const newsRouter = require('./routes/news');
const sectorsRouter = require('./routes/sectors');
const recommendationRouter = require('./routes/recommendations');
const filterRouter = require('./routes/filter');
const searchRouter = require('./routes/search');
const watchlistRouter = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 3001;

// ========== 中间件配置 ==========
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(performanceMonitor);

// ========== API 路由 ==========

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await db.testConnection();
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

// API 文档
app.get('/api', (req, res) => {
  res.json({
    name: 'QuantViz API V2',
    version: '2.0.0',
    description: '股票分析平台API',
    endpoints: {
      health: 'GET /api/health - 健康检查',
      indices: {
        list: 'GET /api/indices - 获取指数列表',
        detail: 'GET /api/indices/:symbol - 获取指数详情',
        kline: 'GET /api/indices/:symbol/kline - 获取K线数据'
      },
      news: {
        list: 'GET /api/news - 获取资讯列表',
        detail: 'GET /api/news/:id - 获取资讯详情'
      },
      sectors: {
        flow: 'GET /api/sectors/flow - 获取板块资金流向',
        detail: 'GET /api/sectors/:code - 获取板块详情',
        stocks: 'GET /api/sectors/:code/stocks - 获取板块成分股'
      }
    },
    documentation: 'https://github.com/zhaohongle/quantviz-fullstack'
  });
});

// 挂载路由
app.use('/api/indices', indicesRouter);
app.use('/api/news', newsRouter);
app.use('/api/sectors', sectorsRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/filter', filterRouter);
app.use('/api/search', searchRouter);
app.use('/api/watchlist', watchlistRouter);

// ========== 错误处理 ==========
app.use(notFound);
app.use(errorHandler);

// ========== 数据更新任务 ==========
async function updateData() {
  try {
    console.log('⏰ 开始更新数据...');
    const startTime = Date.now();
    
    // 这里将调用 scripts/fetch-data.js 中的数据采集函数
    // 并将数据写入数据库
    // TODO: 实现数据采集和存储逻辑
    
    const duration = Date.now() - startTime;
    console.log(`✅ 数据更新完成！耗时: ${duration}ms`);
    
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
    console.log('🚀 服务器启动中...');
    
    // 测试数据库连接
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.warn('⚠️  数据库连接失败，部分功能可能不可用');
    }
    
    // 启动定时任务（可选）
    if (process.env.ENABLE_SCHEDULER === 'true') {
      setupScheduler();
    }
    
    // 启动HTTP服务
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n✅ QuantViz API V2 已启动！');
      console.log(`   地址: http://localhost:${PORT}`);
      console.log(`   健康检查: http://localhost:${PORT}/api/health`);
      console.log(`   API文档: http://localhost:${PORT}/api`);
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
  db.pool.end(() => {
    console.log('✅ 数据库连接池已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 收到退出信号，正在关闭服务器...');
  db.pool.end(() => {
    console.log('✅ 数据库连接池已关闭');
    process.exit(0);
  });
});

// 启动
startServer();
