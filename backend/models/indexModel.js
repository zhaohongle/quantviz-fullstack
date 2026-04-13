// ========================================
// 指数数据模型
// ========================================

const db = require('../config/database');
const { mockIndices, mockKlines } = require('../config/mockData');

// 使用模拟数据（开发测试）
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || true;

/**
 * 获取所有指数列表
 */
async function getAllIndices(market = null) {
  if (USE_MOCK_DATA) {
    let data = mockIndices;
    if (market) {
      data = data.filter(item => item.market === market);
    }
    return data;
  }
  let query = `
    SELECT 
      i.id,
      i.symbol,
      i.name,
      i.market,
      i.display_order,
      q.current_price,
      q.change_amount,
      q.change_percent,
      q.open_price,
      q.high_price,
      q.low_price,
      q.close_price,
      q.volume,
      q.amount,
      q.quote_time
    FROM indices i
    LEFT JOIN LATERAL (
      SELECT * FROM index_quotes
      WHERE symbol = i.symbol
      ORDER BY quote_time DESC
      LIMIT 1
    ) q ON true
    WHERE i.is_active = true
  `;
  
  const params = [];
  
  if (market) {
    query += ` AND i.market = $1`;
    params.push(market);
  }
  
  query += ` ORDER BY i.display_order ASC`;
  
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * 获取单个指数详情
 */
async function getIndexBySymbol(symbol) {
  if (USE_MOCK_DATA) {
    return mockIndices.find(item => item.symbol === symbol) || null;
  }
  const query = `
    SELECT 
      i.id,
      i.symbol,
      i.name,
      i.market,
      q.current_price,
      q.change_amount,
      q.change_percent,
      q.open_price,
      q.high_price,
      q.low_price,
      q.close_price,
      q.volume,
      q.amount,
      q.quote_time
    FROM indices i
    LEFT JOIN LATERAL (
      SELECT * FROM index_quotes
      WHERE symbol = i.symbol
      ORDER BY quote_time DESC
      LIMIT 1
    ) q ON true
    WHERE i.symbol = $1 AND i.is_active = true
  `;
  
  const result = await db.query(query, [symbol]);
  return result.rows[0] || null;
}

/**
 * 获取指数K线数据
 */
async function getIndexKline(symbol, period = '1d', limit = 100) {
  if (USE_MOCK_DATA) {
    return mockKlines.slice(0, limit);
  }
  const query = `
    SELECT 
      kline_time,
      open_price,
      high_price,
      low_price,
      close_price,
      volume,
      amount
    FROM index_kline
    WHERE symbol = $1 AND period = $2
    ORDER BY kline_time DESC
    LIMIT $3
  `;
  
  const result = await db.query(query, [symbol, period, limit]);
  return result.rows.reverse(); // 按时间正序返回
}

/**
 * 插入指数行情数据
 */
async function insertIndexQuote(quoteData) {
  const query = `
    INSERT INTO index_quotes (
      symbol, current_price, change_amount, change_percent,
      open_price, high_price, low_price, close_price,
      volume, amount, quote_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `;
  
  const values = [
    quoteData.symbol,
    quoteData.currentPrice,
    quoteData.changeAmount,
    quoteData.changePercent,
    quoteData.openPrice || null,
    quoteData.highPrice || null,
    quoteData.lowPrice || null,
    quoteData.closePrice || null,
    quoteData.volume || null,
    quoteData.amount || null,
    quoteData.quoteTime
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

/**
 * 批量插入K线数据
 */
async function insertIndexKlines(klineData) {
  if (!klineData || klineData.length === 0) return;
  
  const query = `
    INSERT INTO index_kline (
      symbol, period, kline_time, open_price, high_price,
      low_price, close_price, volume, amount
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (symbol, period, kline_time) DO UPDATE SET
      open_price = EXCLUDED.open_price,
      high_price = EXCLUDED.high_price,
      low_price = EXCLUDED.low_price,
      close_price = EXCLUDED.close_price,
      volume = EXCLUDED.volume,
      amount = EXCLUDED.amount
  `;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const kline of klineData) {
      const values = [
        kline.symbol,
        kline.period,
        kline.klineTime,
        kline.openPrice,
        kline.highPrice,
        kline.lowPrice,
        kline.closePrice,
        kline.volume || null,
        kline.amount || null
      ];
      
      await client.query(query, values);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllIndices,
  getIndexBySymbol,
  getIndexKline,
  insertIndexQuote,
  insertIndexKlines
};
