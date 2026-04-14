// Vercel Serverless Function: Filter Strategies
const mockStrategies = [
  {
    id: "hot-today",
    name: "今日最值得关注",
    icon: "🔥",
    description: "AI高分 + 资金流入 + 未追高",
    targetUser: "每天早上快速找机会",
    count: 6,
    topPicks: [
      { code: "600519", name: "贵州茅台", changePercent: 1.25, score: 95 },
      { code: "000858", name: "五粮液", changePercent: 0.85, score: 89 },
      { code: "601318", name: "中国平安", changePercent: 1.50, score: 85 }
    ]
  },
  {
    id: "value-invest",
    name: "价值投资精选",
    icon: "💎",
    description: "大盘蓝筹 + 高ROE + 低估值",
    targetUser: "长期投资者",
    count: 4,
    topPicks: [
      { code: "601398", name: "工商银行", changePercent: 0.50, score: 88 },
      { code: "600036", name: "招商银行", changePercent: 0.75, score: 86 },
      { code: "601166", name: "兴业银行", changePercent: 0.60, score: 82 }
    ]
  },
  {
    id: "tech-growth",
    name: "科技成长",
    icon: "🚀",
    description: "研发投入高 + 业绩增速快",
    targetUser: "成长股投资者",
    count: 5,
    topPicks: [
      { code: "300750", name: "宁德时代", changePercent: 2.10, score: 92 },
      { code: "603259", name: "药明康德", changePercent: 1.85, score: 88 },
      { code: "688981", name: "中芯国际", changePercent: 1.50, score: 85 }
    ]
  },
  {
    id: "dividend-star",
    name: "高股息红利",
    icon: "💰",
    description: "股息率 > 4% + 连续分红",
    targetUser: "稳健投资者",
    count: 8,
    topPicks: [
      { code: "601857", name: "中国石油", changePercent: 0.30, score: 80 },
      { code: "601288", name: "农业银行", changePercent: 0.45, score: 78 },
      { code: "600028", name: "中国石化", changePercent: 0.35, score: 76 }
    ]
  },
  {
    id: "fund-flow-in",
    name: "资金抢筹",
    icon: "💸",
    description: "北向资金 + 主力净流入",
    targetUser: "短线交易者",
    count: 7,
    topPicks: [
      { code: "600519", name: "贵州茅台", changePercent: 1.25, score: 95 },
      { code: "601318", name: "中国平安", changePercent: 1.50, score: 85 },
      { code: "000001", name: "平安银行", changePercent: 1.20, score: 83 }
    ]
  },
  {
    id: "oversold-rebound",
    name: "超跌反弹",
    icon: "📈",
    description: "RSI < 30 + 基本面良好",
    targetUser: "抄底投资者",
    count: 3,
    topPicks: [
      { code: "002594", name: "比亚迪", changePercent: 2.50, score: 87 },
      { code: "600809", name: "山西汾酒", changePercent: 1.80, score: 84 },
      { code: "000568", name: "泸州老窖", changePercent: 1.60, score: 82 }
    ]
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    res.status(200).json({
      data: mockStrategies,
      lastUpdate: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      error: '获取筛选策略失败',
      message: error.message
    });
  }
};
