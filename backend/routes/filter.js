// ========================================
// 智能筛选引擎路由
// ========================================

const express = require('express');
const router = express.Router();
const filterEngine = require('../filter-engine');

// ========== 获取所有预设策略 ==========
// GET /api/filter/strategies
router.get('/strategies', async (req, res) => {
  try {
    const strategies = await filterEngine.getAllStrategiesWithCount();
    
    res.json({
      success: true,
      data: strategies,
      count: strategies.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取策略列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 应用预设策略 ==========
// GET /api/filter/strategy/:strategyId
router.get('/strategy/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    
    const result = await filterEngine.applyStrategy(strategyId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('应用策略失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 自定义筛选 ==========
// GET /api/filter/stocks?sector=白酒&minScore=80&...
router.get('/stocks', async (req, res) => {
  try {
    const filters = req.query;
    
    // 处理数组参数（如 sectors）
    if (filters.sectors && typeof filters.sectors === 'string') {
      filters.sectors = filters.sectors.split(',');
    }
    if (filters.riskLevel && typeof filters.riskLevel === 'string') {
      filters.riskLevel = filters.riskLevel.split(',');
    }
    if (filters.technicalSignal && typeof filters.technicalSignal === 'string') {
      filters.technicalSignal = filters.technicalSignal.split(',');
    }
    
    // 转换数值参数
    const numericFields = ['minMarketCap', 'maxMarketCap', 'minRevenueGrowth', 'minROE', 'minScore', 'volumeRatio', 'minDividendYield'];
    numericFields.forEach(field => {
      if (filters[field]) {
        filters[field] = parseFloat(filters[field]);
      }
    });
    
    const stocks = await filterEngine.filterStocks(filters);
    
    res.json({
      success: true,
      data: stocks,
      count: stocks.length,
      filters,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('自定义筛选失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 获取所有筛选维度 ==========
// GET /api/filter/dimensions
router.get('/dimensions', async (req, res) => {
  try {
    const dimensions = filterEngine.FILTER_DIMENSIONS;
    
    res.json({
      success: true,
      data: dimensions,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取筛选维度失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
