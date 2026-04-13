// ========================================
// 板块路由
// ========================================

const express = require('express');
const router = express.Router();
const sectorsController = require('../controllers/sectorsController');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/sectors/flow
 * @desc    获取板块资金流向排行
 * @query   type - 板块类型（industry/concept/region）
 * @query   sortBy - 排序字段（main_inflow/change_percent/total_amount）
 * @query   order - 排序方向（ASC/DESC）
 * @query   limit - 数量限制（默认50）
 */
router.get('/flow', asyncHandler(sectorsController.getSectorFlow));

/**
 * @route   GET /api/sectors/:code
 * @desc    获取板块详情
 * @param   code - 板块代码
 */
router.get('/:code', asyncHandler(sectorsController.getSectorDetail));

/**
 * @route   GET /api/sectors/:code/stocks
 * @desc    获取板块成分股
 * @param   code - 板块代码
 * @query   limit - 数量限制（默认100）
 */
router.get('/:code/stocks', asyncHandler(sectorsController.getSectorStocks));

module.exports = router;
