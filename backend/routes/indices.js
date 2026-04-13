// ========================================
// 指数路由
// ========================================

const express = require('express');
const router = express.Router();
const indicesController = require('../controllers/indicesController');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/indices
 * @desc    获取指数列表
 * @query   market - 市场代码（CN/US/HK）
 * @example GET /api/indices?market=CN
 */
router.get('/', asyncHandler(indicesController.getIndices));

/**
 * @route   GET /api/indices/:symbol
 * @desc    获取指数详情
 * @param   symbol - 指数代码（如 sh000001）
 * @example GET /api/indices/sh000001
 */
router.get('/:symbol', asyncHandler(indicesController.getIndexDetail));

/**
 * @route   GET /api/indices/:symbol/kline
 * @desc    获取指数K线数据
 * @param   symbol - 指数代码
 * @query   period - 周期（5m/15m/30m/1h/1d/1w/1M）
 * @query   limit - 数据条数（默认100，最大1000）
 * @example GET /api/indices/sh000001/kline?period=1d&limit=30
 */
router.get('/:symbol/kline', asyncHandler(indicesController.getIndexKline));

module.exports = router;
