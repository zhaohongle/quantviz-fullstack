// ========================================
// 板块控制器
// ========================================

const sectorModel = require('../models/sectorModel');
const { ApiError } = require('../middleware/errorHandler');

/**
 * 获取板块资金流向排行
 * GET /api/sectors/flow?type=industry&sortBy=main_inflow&limit=50
 */
async function getSectorFlow(req, res) {
  const { type, sortBy = 'main_inflow', order = 'DESC', limit = 50 } = req.query;
  
  const options = {
    type,
    sortBy,
    order,
    limit: parseInt(limit)
  };
  
  const sectors = await sectorModel.getSectorFlowRanking(options);
  
  res.json({
    success: true,
    data: sectors,
    count: sectors.length,
    timestamp: new Date().toISOString()
  });
}

/**
 * 获取板块详情
 * GET /api/sectors/:code
 */
async function getSectorDetail(req, res) {
  const { code } = req.params;
  
  const sector = await sectorModel.getSectorByCode(code);
  
  if (!sector) {
    throw new ApiError(404, `板块不存在: ${code}`);
  }
  
  res.json({
    success: true,
    data: sector,
    timestamp: new Date().toISOString()
  });
}

/**
 * 获取板块成分股
 * GET /api/sectors/:code/stocks?limit=100
 */
async function getSectorStocks(req, res) {
  const { code } = req.params;
  const { limit = 100 } = req.query;
  
  const stocks = await sectorModel.getSectorStocks(code, parseInt(limit));
  
  res.json({
    success: true,
    data: {
      sectorCode: code,
      stocks
    },
    count: stocks.length,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getSectorFlow,
  getSectorDetail,
  getSectorStocks
};
