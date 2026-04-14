// ========================================
// AI推荐引擎路由
// ========================================

const express = require('express');
const router = express.Router();
const recommendationEngine = require('../recommendation-engine');

// ========== 获取推荐列表 ==========
// GET /api/recommendations?risk=low|medium|high
router.get('/', async (req, res) => {
  try {
    const { risk } = req.query;
    const riskLevel = risk || 'medium'; // 默认中等风险
    
    const recommendations = await recommendationEngine.generateEnhancedRecommendations(riskLevel);
    
    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      riskLevel,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取推荐列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 获取详细推荐 ==========
// GET /api/recommendations/detailed/:code
router.get('/detailed/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // 先获取所有推荐
    const recommendations = await recommendationEngine.generateEnhancedRecommendations();
    
    // 找到对应股票
    const detail = recommendations.find(r => r.code === code);
    
    if (!detail) {
      return res.status(404).json({
        success: false,
        error: '未找到该股票的推荐信息'
      });
    }
    
    res.json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('获取详细推荐失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 获取准确率统计 ==========
// GET /api/recommendations/accuracy
router.get('/accuracy', async (req, res) => {
  try {
    const accuracy = recommendationEngine.generateAccuracyStats();
    
    res.json({
      success: true,
      data: accuracy,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取准确率统计失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
