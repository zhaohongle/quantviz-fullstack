// ========================================
// 资讯控制器
// ========================================

const newsModel = require('../models/newsModel');
const { ApiError } = require('../middleware/errorHandler');

/**
 * 获取资讯列表
 * GET /api/news?category=股市&limit=50&offset=0
 */
async function getNews(req, res) {
  const { category, limit = 50, offset = 0, important } = req.query;
  
  const options = {
    category,
    limit: parseInt(limit),
    offset: parseInt(offset),
    isImportant: important === 'true' ? true : important === 'false' ? false : null
  };
  
  const news = await newsModel.getAllNews(options);
  
  res.json({
    success: true,
    data: news,
    count: news.length,
    pagination: {
      limit: options.limit,
      offset: options.offset
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * 获取资讯详情
 * GET /api/news/:id
 */
async function getNewsDetail(req, res) {
  const { id } = req.params;
  
  const news = await newsModel.getNewsById(parseInt(id));
  
  if (!news) {
    throw new ApiError(404, `资讯不存在: ${id}`);
  }
  
  res.json({
    success: true,
    data: news,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getNews,
  getNewsDetail
};
