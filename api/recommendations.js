// Vercel Serverless Function: AI Recommendations
const mockRecommendations = [
  {
    code: "600519",
    name: "贵州茅台",
    price: 1680.50,
    changePercent: 1.25,
    sector: "白酒",
    score: 95,
    rating: "强烈推荐",
    ratingColor: "#00e676",
    targetPrice: 1850.00,
    currentPrice: 1680.50,
    reasons: [
      {
        category: "基本面",
        title: "财务数据优异",
        detail: "2024Q3 营收增长 18.2%，净利润率 52.8%，ROE 28.5%，均为行业领先",
        confidence: "高",
        source: "财报"
      },
      {
        category: "基本面",
        title: "行业龙头地位稳固",
        detail: "市占率 35.8%，品牌护城河深厚，定价权强",
        confidence: "高",
        source: "行业研报"
      },
      {
        category: "技术面",
        title: "突破关键阻力位",
        detail: "股价突破 1650 元关键阻力位，MACD 金叉，成交量放大",
        confidence: "中",
        source: "技术分析"
      }
    ],
    risks: [
      {
        level: "低",
        description: "估值略高，当前 PE 约 35 倍，略高于历史中位数",
        impact: "短期可能回调 5-8%"
      }
    ],
    accuracy: {
      historical: "85%",
      recent30Days: "90%",
      predictedReturn: "+10-15%"
    }
  },
  {
    code: "000858",
    name: "五粮液",
    price: 158.30,
    changePercent: 0.85,
    sector: "白酒",
    score: 89,
    rating: "推荐",
    ratingColor: "#4caf50",
    targetPrice: 175.00,
    currentPrice: 158.30,
    reasons: [
      {
        category: "基本面",
        title: "业绩稳健增长",
        detail: "2024Q3 营收增长 12.5%，净利润率 28.3%",
        confidence: "高",
        source: "财报"
      },
      {
        category: "技术面",
        title: "技术指标良好",
        detail: "均线多头排列，RSI 处于健康区间",
        confidence: "中",
        source: "技术分析"
      }
    ],
    risks: [
      {
        level: "中",
        description: "行业竞争加剧，市占率略有下降",
        impact: "增长可能放缓"
      }
    ],
    accuracy: {
      historical: "80%",
      recent30Days: "85%",
      predictedReturn: "+8-12%"
    }
  },
  {
    code: "601318",
    name: "中国平安",
    price: 52.80,
    changePercent: 1.50,
    sector: "保险",
    score: 85,
    rating: "推荐",
    ratingColor: "#4caf50",
    targetPrice: 58.00,
    currentPrice: 52.80,
    reasons: [
      {
        category: "基本面",
        title: "估值低位",
        detail: "当前 PB 约 0.85 倍,处于历史低位",
        confidence: "高",
        source: "估值分析"
      },
      {
        category: "资金面",
        title: "北向资金持续流入",
        detail: "近 5 日净流入 8.5 亿元",
        confidence: "高",
        source: "资金流向"
      }
    ],
    risks: [
      {
        level: "中",
        description: "宏观经济波动影响保费收入",
        impact: "业绩增长不确定性"
      }
    ],
    accuracy: {
      historical: "78%",
      recent30Days: "82%",
      predictedReturn: "+8-10%"
    }
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { risk } = req.query;
    
    // 如果有风险偏好筛选，返回对应数据
    let filteredRecommendations = mockRecommendations;
    if (risk === 'low') {
      filteredRecommendations = mockRecommendations.filter(r => r.score >= 90);
    } else if (risk === 'medium') {
      filteredRecommendations = mockRecommendations.filter(r => r.score >= 80);
    }
    
    res.status(200).json({
      data: filteredRecommendations,
      riskLevel: risk || 'all',
      lastUpdate: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      error: '获取推荐失败',
      message: error.message
    });
  }
};
