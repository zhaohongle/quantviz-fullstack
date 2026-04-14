// ========================================
// 自选股管理路由
// ========================================

const express = require('express');
const router = express.Router();
const dataFetcher = require('../data-fetcher');

// 模拟数据库（实际应使用数据库，这里用内存存储演示）
// 在生产环境应使用 MongoDB/MySQL + 用户鉴权
let watchlistStore = new Map(); // key: userId, value: [stock codes]

// 默认用户ID（因为MVP没有登录系统）
const DEFAULT_USER_ID = 'default_user';

// ========== 获取自选股列表 ==========
// GET /api/watchlist
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    
    // 获取用户的自选股代码列表
    const codes = watchlistStore.get(userId) || [];
    
    if (codes.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: '暂无自选股'
      });
    }
    
    // 直接获取股票数据
    const allStocks = await dataFetcher.fetchStocks();
    const recommendations = await dataFetcher.fetchRecommendations();
    
    // 根据代码筛选股票
    const watchlistStocks = allStocks.filter(stock => 
      codes.includes(stock.code)
    );
    
    // 补充AI评分（如果有推荐数据）
    if (recommendations && recommendations.data) {
      watchlistStocks.forEach(stock => {
        const recommendation = recommendations.data.find(r => r.code === stock.code);
        if (recommendation) {
          stock.aiScore = recommendation.score;
          stock.riskLevel = recommendation.risk;
          stock.reason = recommendation.shortReason;
        }
      });
    }
    
    res.json({
      success: true,
      data: watchlistStocks,
      count: watchlistStocks.length,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('获取自选股列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 添加自选股 ==========
// POST /api/watchlist
// Body: { code: "600519", name: "贵州茅台" }
router.post('/', (req, res) => {
  try {
    const { code, name } = req.body;
    const userId = req.body.userId || DEFAULT_USER_ID;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: '股票代码不能为空'
      });
    }
    
    // 获取或初始化用户自选股列表
    let userWatchlist = watchlistStore.get(userId) || [];
    
    // 检查是否已存在
    if (userWatchlist.includes(code)) {
      return res.status(409).json({
        success: false,
        error: '该股票已在自选股中'
      });
    }
    
    // 添加到列表
    userWatchlist.push(code);
    watchlistStore.set(userId, userWatchlist);
    
    console.log(`✅ 用户 ${userId} 添加自选股: ${code} ${name || ''}`);
    
    res.json({
      success: true,
      message: '添加成功',
      data: {
        code,
        name,
        addedAt: Date.now()
      }
    });
    
  } catch (error) {
    console.error('添加自选股失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 删除自选股 ==========
// DELETE /api/watchlist/:code
router.delete('/:code', (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.query.userId || DEFAULT_USER_ID;
    
    let userWatchlist = watchlistStore.get(userId) || [];
    
    // 检查是否存在
    if (!userWatchlist.includes(code)) {
      return res.status(404).json({
        success: false,
        error: '该股票不在自选股中'
      });
    }
    
    // 移除
    userWatchlist = userWatchlist.filter(c => c !== code);
    watchlistStore.set(userId, userWatchlist);
    
    console.log(`✅ 用户 ${userId} 删除自选股: ${code}`);
    
    res.json({
      success: true,
      message: '删除成功',
      data: { code }
    });
    
  } catch (error) {
    console.error('删除自选股失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 批量添加（可选功能）==========
// POST /api/watchlist/batch
// Body: { codes: ["600519", "000858", "600036"] }
router.post('/batch', (req, res) => {
  try {
    const { codes } = req.body;
    const userId = req.body.userId || DEFAULT_USER_ID;
    
    if (!codes || !Array.isArray(codes)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的股票代码数组'
      });
    }
    
    let userWatchlist = watchlistStore.get(userId) || [];
    
    // 过滤已存在的
    const newCodes = codes.filter(code => !userWatchlist.includes(code));
    
    if (newCodes.length === 0) {
      return res.status(409).json({
        success: false,
        error: '所有股票已在自选股中'
      });
    }
    
    // 批量添加
    userWatchlist = [...userWatchlist, ...newCodes];
    watchlistStore.set(userId, userWatchlist);
    
    console.log(`✅ 用户 ${userId} 批量添加 ${newCodes.length} 只自选股`);
    
    res.json({
      success: true,
      message: `成功添加 ${newCodes.length} 只股票`,
      data: {
        added: newCodes,
        total: userWatchlist.length
      }
    });
    
  } catch (error) {
    console.error('批量添加失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 清空自选股 ==========
// DELETE /api/watchlist
router.delete('/', (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    
    watchlistStore.set(userId, []);
    
    console.log(`✅ 用户 ${userId} 清空自选股`);
    
    res.json({
      success: true,
      message: '自选股已清空'
    });
    
  } catch (error) {
    console.error('清空自选股失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 搜索股票（辅助功能）==========
// GET /api/watchlist/search?q=茅台
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词至少2个字符'
      });
    }
    
    const cachedData = req.app.locals.cachedData;
    
    if (!cachedData || !cachedData.stocks) {
      return res.status(503).json({
        success: false,
        error: '数据暂未加载'
      });
    }
    
    // 模糊搜索（代码或名称）
    const results = cachedData.stocks.filter(stock =>
      stock.code.includes(q) || stock.name.includes(q)
    ).slice(0, 20); // 限制20条
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query: q
    });
    
  } catch (error) {
    console.error('搜索股票失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
