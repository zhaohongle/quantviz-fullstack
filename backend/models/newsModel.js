// ========================================
// 资讯数据模型
// ========================================

const db = require('../config/database');
const { mockNews } = require('../config/mockData');

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true' || true;

/**
 * 获取资讯列表
 */
async function getAllNews(options = {}) {
  if (USE_MOCK_DATA) {
    let data = mockNews;
    
    if (options.category) {
      data = data.filter(item => item.category === options.category);
    }
    
    if (options.isImportant !== null) {
      data = data.filter(item => item.is_important === options.isImportant);
    }
    
    const start = options.offset || 0;
    const end = start + (options.limit || 50);
    return data.slice(start, end);
  }
  const {
    category = null,
    limit = 50,
    offset = 0,
    isImportant = null
  } = options;
  
  let query = `
    SELECT 
      id, title, summary, source, source_url,
      author, publish_time, category, tags,
      related_symbols, view_count, is_important
    FROM news
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (category) {
    query += ` AND category = $${paramIndex++}`;
    params.push(category);
  }
  
  if (isImportant !== null) {
    query += ` AND is_important = $${paramIndex++}`;
    params.push(isImportant);
  }
  
  query += ` ORDER BY publish_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * 获取资讯详情
 */
async function getNewsById(id) {
  if (USE_MOCK_DATA) {
    return mockNews.find(item => item.id === id) || null;
  }
  const query = `
    SELECT * FROM news WHERE id = $1
  `;
  
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * 插入资讯
 */
async function insertNews(newsData) {
  const query = `
    INSERT INTO news (
      title, summary, content, source, source_url,
      author, publish_time, category, tags,
      related_symbols, is_important
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT DO NOTHING
    RETURNING id
  `;
  
  const values = [
    newsData.title,
    newsData.summary || null,
    newsData.content || null,
    newsData.source,
    newsData.sourceUrl,
    newsData.author || null,
    newsData.publishTime,
    newsData.category || '股市',
    newsData.tags || [],
    newsData.relatedSymbols || [],
    newsData.isImportant || false
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

module.exports = {
  getAllNews,
  getNewsById,
  insertNews
};
