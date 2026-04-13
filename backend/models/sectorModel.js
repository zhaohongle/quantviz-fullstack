// ========================================
// 板块数据模型
// ========================================

const db = require('../config/database');
const { mockSectors } = require('../config/mockData');

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || true;

/**
 * 获取板块资金流向排行
 */
async function getSectorFlowRanking(options = {}) {
  if (USE_MOCK_DATA) {
    let data = [...mockSectors];
    
    if (options.type) {
      data = data.filter(item => item.type === options.type);
    }
    
    // 排序
    const sortBy = options.sortBy || 'main_inflow';
    const order = options.order || 'DESC';
    data.sort((a, b) => {
      if (order === 'DESC') {
        return b[sortBy] - a[sortBy];
      } else {
        return a[sortBy] - b[sortBy];
      }
    });
    
    return data.slice(0, options.limit || 50);
  }
  const {
    type = null,
    sortBy = 'main_inflow',
    order = 'DESC',
    limit = 50
  } = options;
  
  let query = `
    SELECT 
      s.code,
      s.name,
      s.type,
      sf.main_inflow,
      sf.super_inflow,
      sf.large_inflow,
      sf.change_percent,
      sf.total_amount,
      sf.leading_stock,
      sf.flow_date,
      sf.flow_time
    FROM sectors s
    INNER JOIN LATERAL (
      SELECT * FROM sector_flow
      WHERE sector_code = s.code
      ORDER BY flow_date DESC, flow_time DESC
      LIMIT 1
    ) sf ON true
    WHERE s.is_active = true
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (type) {
    query += ` AND s.type = $${paramIndex++}`;
    params.push(type);
  }
  
  query += ` ORDER BY sf.${sortBy} ${order} LIMIT $${paramIndex++}`;
  params.push(limit);
  
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * 获取板块详情
 */
async function getSectorByCode(code) {
  if (USE_MOCK_DATA) {
    return mockSectors.find(item => item.code === code) || null;
  }
  const query = `
    SELECT 
      s.*,
      sf.main_inflow,
      sf.change_percent,
      sf.total_amount,
      sf.flow_date,
      sf.flow_time
    FROM sectors s
    LEFT JOIN LATERAL (
      SELECT * FROM sector_flow
      WHERE sector_code = s.code
      ORDER BY flow_date DESC, flow_time DESC
      LIMIT 1
    ) sf ON true
    WHERE s.code = $1
  `;
  
  const result = await db.query(query, [code]);
  return result.rows[0] || null;
}

/**
 * 获取板块成分股
 */
async function getSectorStocks(code, limit = 100) {
  if (USE_MOCK_DATA) {
    // 模拟数据：生成一些成分股
    return Array.from({ length: Math.min(10, limit) }, (_, i) => ({
      stock_code: `${String(i + 600000).padStart(6, '0')}`,
      stock_name: `成分股${i + 1}`,
      weight: Math.random() * 10,
      is_leading: i === 0,
      current_price: 10 + Math.random() * 50,
      change_percent: (Math.random() - 0.5) * 10,
      main_inflow: (Math.random() - 0.5) * 10000,
      total_amount: Math.random() * 100000
    }));
  }
  const query = `
    SELECT 
      ss.stock_code,
      ss.stock_name,
      ss.weight,
      ss.is_leading,
      sf.current_price,
      sf.change_percent,
      sf.main_inflow,
      sf.total_amount
    FROM sector_stocks ss
    LEFT JOIN LATERAL (
      SELECT * FROM stock_flow
      WHERE stock_code = ss.stock_code
      ORDER BY flow_date DESC, flow_time DESC
      LIMIT 1
    ) sf ON true
    WHERE ss.sector_code = $1
    ORDER BY ss.is_leading DESC, sf.main_inflow DESC
    LIMIT $2
  `;
  
  const result = await db.query(query, [code, limit]);
  return result.rows;
}

module.exports = {
  getSectorFlowRanking,
  getSectorByCode,
  getSectorStocks
};
