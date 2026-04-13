// ========================================
// 资讯路由
// ========================================

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/news
 * @desc    获取资讯列表
 * @query   category - 分类（股市/债市/外汇/商品）
 * @query   limit - 每页数量（默认50）
 * @query   offset - 偏移量（默认0）
 * @query   important - 是否只看重要资讯（true/false）
 */
router.get('/', asyncHandler(newsController.getNews));

/**
 * @route   GET /api/news/:id
 * @desc    获取资讯详情
 * @param   id - 资讯ID
 */
router.get('/:id', asyncHandler(newsController.getNewsDetail));

module.exports = router;
