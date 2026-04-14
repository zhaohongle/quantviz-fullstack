// ========================================
// 全局搜索路由 - 支持多维度股票搜索
// ========================================

const express = require('express');
const router = express.Router();
const dataFetcher = require('../data-fetcher');

// ========== 拼音首字母映射表（常见股票） ==========
const PINYIN_MAP = {
  // 白酒板块
  '贵州茅台': 'gzmt',
  '五粮液': 'wly',
  '泸州老窖': 'lzlj',
  '山西汾酒': 'sxfj',
  '洋河股份': 'yhgf',
  
  // 银行板块
  '中国平安': 'zgpa',
  '招商银行': 'zsyh',
  '工商银行': 'gsyh',
  '建设银行': 'jsyh',
  
  // 科技板块
  '比亚迪': 'byd',
  '宁德时代': 'ndsd',
  '中芯国际': 'zxgj',
  '东方财富': 'dfcf',
  
  // 其他常见股票
  '中国移动': 'zgyd',
  '中国电信': 'zgdx',
  '中国联通': 'zglt',
  '格力电器': 'gldq',
  '美的集团': 'mdjt',
  '海天味业': 'htwy',
  '立讯精密': 'lxjm',
  '隆基绿能': 'ljln',
  '天齐锂业': 'tqly'
};

// ========== 将汉字转换为拼音首字母（简单实现） ==========
function toPinyinInitials(text) {
  if (PINYIN_MAP[text]) {
    return PINYIN_MAP[text];
  }
  
  // 简单映射：如果没有预设映射，返回空字符串
  // 完整实现需要引入 pinyin 库
  return '';
}

// ========== 计算搜索相关度分数 ==========
function calculateRelevanceScore(stock, query) {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  // 1. 股票代码完全匹配（最高权重）
  if (stock.code === query) {
    score += 100;
  } else if (stock.code.includes(query)) {
    score += 50;
  }
  
  // 2. 股票名称完全匹配
  if (stock.name === query) {
    score += 90;
  } else if (stock.name.includes(query)) {
    score += 40;
  }
  
  // 3. 拼音首字母匹配
  const pinyin = toPinyinInitials(stock.name);
  if (pinyin && pinyin === lowerQuery) {
    score += 80;
  } else if (pinyin && pinyin.includes(lowerQuery)) {
    score += 30;
  }
  
  // 4. 部分匹配奖励
  if (stock.name.startsWith(query)) {
    score += 20;
  }
  
  return score;
}

// ========== 搜索股票（主接口） ==========
// GET /api/search?q=茅台
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: '请输入搜索关键词'
      });
    }
    
    const query = q.trim();
    
    // 获取所有股票数据
    const allStocks = await dataFetcher.fetchStocks();
    
    // 筛选并计算相关度
    const results = allStocks
      .map(stock => ({
        ...stock,
        relevanceScore: calculateRelevanceScore(stock, query)
      }))
      .filter(stock => stock.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // 最多返回20个结果
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 实时搜索建议（自动补全） ==========
// GET /api/search/suggestions?q=gz
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }
    
    const query = q.trim().toLowerCase();
    
    // 获取所有股票
    const allStocks = await dataFetcher.fetchStocks();
    
    // 快速匹配（只返回前5个最相关的）
    const suggestions = allStocks
      .map(stock => ({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        price: stock.price,
        changePercent: stock.changePercent,
        relevanceScore: calculateRelevanceScore(stock, query)
      }))
      .filter(stock => stock.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
      query,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 热门搜索（基于成交量） ==========
// GET /api/search/hot
router.get('/hot', async (req, res) => {
  try {
    const allStocks = await dataFetcher.fetchStocks();
    
    // 按成交额排序，返回前10
    const hotStocks = allStocks
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(stock => ({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        price: stock.price,
        changePercent: stock.changePercent
      }));
    
    res.json({
      success: true,
      data: hotStocks,
      count: hotStocks.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取热门搜索失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
