// ========================================
// 指数控制器
// ========================================

const indexModel = require('../models/indexModel');
const { ApiError } = require('../middleware/errorHandler');

/**
 * 获取指数列表
 * GET /api/indices?market=CN
 */
async function getIndices(req, res) {
  const { market } = req.query;
  
  const indices = await indexModel.getAllIndices(market);
  
  res.json({
    success: true,
    data: indices,
    count: indices.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * 获取指数详情
 * GET /api/indices/:symbol
 */
async function getIndexDetail(req, res) {
  const { symbol } = req.params;
  
  const index = await indexModel.getIndexBySymbol(symbol);
  
  if (!index) {
    throw new ApiError(404, `指数不存在: ${symbol}`);
  }
  
  res.json({
    success: true,
    data: index,
    timestamp: new Date().toISOString()
  });
}

/**
 * 获取指数K线数据
 * GET /api/indices/:symbol/kline?period=1d&limit=100
 */
async function getIndexKline(req, res) {
  const { symbol } = req.params;
  const { period = '1d', limit = 100 } = req.query;
  
  // 验证周期参数
  const validPeriods = ['5m', '15m', '30m', '1h', '1d', '1w', '1M'];
  if (!validPeriods.includes(period)) {
    throw new ApiError(400, `无效的周期参数: ${period}，有效值: ${validPeriods.join(', ')}`);
  }
  
  // 验证数量限制
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
    throw new ApiError(400, '数量限制必须在 1-1000 之间');
  }
  
  const klines = await indexModel.getIndexKline(symbol, period, limitNum);
  
  res.json({
    success: true,
    data: {
      symbol,
      period,
      klines
    },
    count: klines.length,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getIndices,
  getIndexDetail,
  getIndexKline
};
