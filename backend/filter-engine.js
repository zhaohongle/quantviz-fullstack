// ========== QuantViz 智能筛选引擎 ==========
// 核心功能：多维度筛选 + 预设策略 + 实时结果

const dataFetcher = require('./data-fetcher');

// ========== 预设策略定义 ==========
const PRESET_STRATEGIES = {
  "hot-today": {
    id: "hot-today",
    name: "今日最值得关注",
    icon: "🔥",
    description: "AI高分 + 资金流入 + 未追高",
    targetUser: "每天早上快速找机会",
    filters: {
      minScore: 80,
      maxChangePercent: 5,
      riskLevel: ["低", "中"],
      fundFlow: "连续3日流入"
    },
    sortBy: "score" // score | changePercent | marketCap | fundFlow
  },
  
  "value-invest": {
    id: "value-invest",
    name: "价值投资精选",
    icon: "💎",
    description: "大盘蓝筹 + 高ROE + 低估值",
    targetUser: "长期投资者",
    filters: {
      minMarketCap: 500, // 亿
      minROE: 20,
      sectors: ["白酒", "银行", "保险", "医药"],
      riskLevel: ["低"]
    },
    sortBy: "roe"
  },
  
  "growth-hunter": {
    id: "growth-hunter",
    name: "成长股猎手",
    icon: "🚀",
    description: "高增长 + 热门板块 + AI推荐",
    targetUser: "追求高成长",
    filters: {
      minRevenueGrowth: 30,
      minMarketCap: 100,
      maxMarketCap: 500,
      sectors: ["新能源", "半导体", "锂电池", "光伏"],
      minScore: 75
    },
    sortBy: "revenueGrowth"
  },
  
  "bottom-fishing": {
    id: "bottom-fishing",
    name: "抄底机会",
    icon: "📉",
    description: "超跌 + 基本面未恶化 + 资金回流",
    targetUser: "逆向投资者",
    filters: {
      maxChangePercent30d: -20, // 近30日跌幅 > 20%
      minScore: 70,
      technicalSignal: "KDJ超卖",
      fundFlow: "开始流入"
    },
    sortBy: "changePercent30d"
  },
  
  "tech-breakout": {
    id: "tech-breakout",
    name: "技术突破",
    icon: "📈",
    description: "突破阻力位 + MACD金叉 + 量价配合",
    targetUser: "技术派",
    filters: {
      technicalSignal: ["突破阻力位", "MACD金叉"],
      volumeRatio: 2, // 成交量放大 > 2倍
      maxChangePercent: 10
    },
    sortBy: "volumeRatio"
  },
  
  "high-dividend": {
    id: "high-dividend",
    name: "高股息稳健",
    icon: "💰",
    description: "高分红 + 大盘股 + 低风险",
    targetUser: "追求稳定收益",
    filters: {
      minDividendYield: 4,
      minMarketCap: 300,
      riskLevel: ["低"],
      consecutiveDividend: 5 // 连续分红年数
    },
    sortBy: "dividendYield"
  }
};

// ========== 可用筛选维度定义 ==========
const FILTER_DIMENSIONS = {
  // 行业与板块
  industry: {
    name: "行业分类",
    type: "multi-select",
    options: ["科技", "医药", "消费", "金融", "制造", "能源", "房地产"]
  },
  
  sector: {
    name: "热门板块",
    type: "multi-select",
    options: ["白酒", "半导体", "锂电池", "光伏", "新能源汽车", "医疗器械", "人工智能", "银行", "保险"]
  },
  
  // 市值与规模
  marketCapRange: {
    name: "市值范围",
    type: "radio",
    options: [
      { label: "全部", value: null },
      { label: "小盘 (<100亿)", value: [0, 100] },
      { label: "中盘 (100-500亿)", value: [100, 500] },
      { label: "大盘 (>500亿)", value: [500, 999999] }
    ]
  },
  
  volumeRatio: {
    name: "成交量（活跃度）",
    type: "slider",
    min: 1,
    max: 5,
    step: 0.5,
    unit: "倍（相比均量）"
  },
  
  // 财务指标
  revenueGrowth: {
    name: "营收增长率",
    type: "radio",
    options: [
      { label: "不限", value: null },
      { label: ">20%", value: 20 },
      { label: ">30%", value: 30 },
      { label: ">50%", value: 50 }
    ]
  },
  
  netProfitMargin: {
    name: "净利润率",
    type: "radio",
    options: [
      { label: "不限", value: null },
      { label: ">10%", value: 10 },
      { label: ">20%", value: 20 },
      { label: ">30%", value: 30 }
    ]
  },
  
  roe: {
    name: "ROE（净资产收益率）",
    type: "radio",
    options: [
      { label: "不限", value: null },
      { label: ">15%", value: 15 },
      { label: ">20%", value: 20 },
      { label: ">25%", value: 25 }
    ]
  },
  
  // 技术指标
  changePeriod: {
    name: "涨跌幅周期",
    type: "tabs",
    options: ["今日", "本周", "本月"]
  },
  
  changePercent: {
    name: "涨跌幅",
    type: "slider",
    min: -20,
    max: 20,
    step: 1,
    unit: "%"
  },
  
  technicalSignal: {
    name: "技术信号",
    type: "multi-select",
    options: ["突破阻力位", "MACD金叉", "KDJ超卖", "KDJ超买", "量价配合"]
  },
  
  // AI 评分
  aiScore: {
    name: "AI推荐评分",
    type: "slider",
    min: 60,
    max: 95,
    step: 5,
    default: 70,
    unit: "分"
  },
  
  riskLevel: {
    name: "风险等级",
    type: "multi-select",
    options: ["低", "中", "高"]
  },
  
  // 资金流向
  fundFlow: {
    name: "主力资金",
    type: "radio",
    options: [
      { label: "不限", value: null },
      { label: "今日流入", value: "1日流入" },
      { label: "连续3日流入", value: "3日流入" },
      { label: "连续5日流入", value: "5日流入" }
    ]
  },
  
  northboundFlow: {
    name: "北向资金",
    type: "radio",
    options: [
      { label: "不限", value: null },
      { label: "净流入", value: "流入" },
      { label: "净流出", value: "流出" }
    ]
  }
};

// ========== 为股票生成 Mock 扩展数据 ==========
function enrichStockData(stock) {
  // 生成 Mock 数据（生产环境应该从真实数据源获取）
  
  return {
    ...stock,
    
    // 财务指标
    revenueGrowth: Math.random() * 40 + 10, // 10-50%
    netProfitMargin: Math.random() * 25 + 10, // 10-35%
    roe: Math.random() * 20 + 10, // 10-30%
    pe: Math.random() * 30 + 15, // 15-45
    dividendYield: Math.random() * 6 + 1, // 1-7%
    
    // 技术指标
    volumeRatio: Math.random() * 3 + 0.8, // 0.8-3.8
    changePercent7d: Math.random() * 20 - 10, // -10% ~ +10%
    changePercent30d: Math.random() * 30 - 15, // -15% ~ +15%
    
    // 技术信号（随机生成）
    technicalSignals: generateTechnicalSignals(),
    
    // 资金流向
    fundFlowDays: Math.floor(Math.random() * 7), // 0-6 连续流入天数
    northboundFlow: Math.random() > 0.5 ? "流入" : "流出",
    
    // AI 评分
    score: Math.random() * 30 + 65, // 65-95
    riskLevel: getRiskLevel(stock),
    
    // 其他
    consecutiveDividend: Math.floor(Math.random() * 10), // 0-9 年
  };
}

// 生成技术信号
function generateTechnicalSignals() {
  const allSignals = ["突破阻力位", "MACD金叉", "KDJ超卖", "KDJ超买", "量价配合"];
  const numSignals = Math.floor(Math.random() * 3); // 0-2 个信号
  const signals = [];
  
  for (let i = 0; i < numSignals; i++) {
    const randomSignal = allSignals[Math.floor(Math.random() * allSignals.length)];
    if (!signals.includes(randomSignal)) {
      signals.push(randomSignal);
    }
  }
  
  return signals;
}

// 判断风险等级
function getRiskLevel(stock) {
  const safeSectors = ["白酒", "银行", "保险", "医药"];
  const riskySectors = ["半导体", "锂电池", "光伏"];
  
  if (safeSectors.includes(stock.sector) && stock.marketCap > 500) {
    return "低";
  } else if (riskySectors.includes(stock.sector) || stock.marketCap < 100) {
    return "高";
  } else {
    return "中";
  }
}

// ========== 核心筛选函数 ==========
async function filterStocks(filters = {}) {
  // 获取所有股票数据
  const stocks = await dataFetcher.fetchStocks();
  
  // 扩展股票数据（添加财务、技术指标等）
  const enrichedStocks = stocks.map(enrichStockData);
  
  // 应用筛选条件
  let filtered = enrichedStocks;
  
  // 1. 行业筛选
  if (filters.industry && filters.industry.length > 0) {
    filtered = filtered.filter(s => filters.industry.includes(s.industry));
  }
  
  // 2. 板块筛选
  if (filters.sectors && filters.sectors.length > 0) {
    filtered = filtered.filter(s => filters.sectors.includes(s.sector));
  }
  
  // 3. 市值筛选
  if (filters.minMarketCap !== undefined) {
    filtered = filtered.filter(s => s.marketCap >= filters.minMarketCap);
  }
  if (filters.maxMarketCap !== undefined) {
    filtered = filtered.filter(s => s.marketCap <= filters.maxMarketCap);
  }
  
  // 4. 财务指标筛选
  if (filters.minRevenueGrowth !== undefined) {
    filtered = filtered.filter(s => s.revenueGrowth >= filters.minRevenueGrowth);
  }
  if (filters.minNetProfitMargin !== undefined) {
    filtered = filtered.filter(s => s.netProfitMargin >= filters.minNetProfitMargin);
  }
  if (filters.minROE !== undefined) {
    filtered = filtered.filter(s => s.roe >= filters.minROE);
  }
  
  // 5. 涨跌幅筛选
  if (filters.minChangePercent !== undefined) {
    filtered = filtered.filter(s => s.changePercent >= filters.minChangePercent);
  }
  if (filters.maxChangePercent !== undefined) {
    filtered = filtered.filter(s => s.changePercent <= filters.maxChangePercent);
  }
  if (filters.maxChangePercent30d !== undefined) {
    filtered = filtered.filter(s => s.changePercent30d <= filters.maxChangePercent30d);
  }
  
  // 6. AI 评分筛选
  if (filters.minScore !== undefined) {
    filtered = filtered.filter(s => s.score >= filters.minScore);
  }
  
  // 7. 风险等级筛选
  if (filters.riskLevel && filters.riskLevel.length > 0) {
    filtered = filtered.filter(s => filters.riskLevel.includes(s.riskLevel));
  }
  
  // 8. 技术信号筛选
  if (filters.technicalSignal) {
    const requiredSignals = Array.isArray(filters.technicalSignal) 
      ? filters.technicalSignal 
      : [filters.technicalSignal];
    
    filtered = filtered.filter(s => 
      requiredSignals.some(signal => s.technicalSignals.includes(signal))
    );
  }
  
  // 9. 资金流向筛选
  if (filters.fundFlow === "连续3日流入") {
    filtered = filtered.filter(s => s.fundFlowDays >= 3);
  } else if (filters.fundFlow === "开始流入") {
    filtered = filtered.filter(s => s.fundFlowDays >= 1);
  }
  
  // 10. 成交量筛选
  if (filters.volumeRatio !== undefined) {
    filtered = filtered.filter(s => s.volumeRatio >= filters.volumeRatio);
  }
  
  // 11. 股息率筛选
  if (filters.minDividendYield !== undefined) {
    filtered = filtered.filter(s => s.dividendYield >= filters.minDividendYield);
  }
  if (filters.consecutiveDividend !== undefined) {
    filtered = filtered.filter(s => s.consecutiveDividend >= filters.consecutiveDividend);
  }
  
  // 排序
  const sortBy = filters.sortBy || 'score';
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'score':
        return b.score - a.score;
      case 'changePercent':
        return b.changePercent - a.changePercent;
      case 'marketCap':
        return b.marketCap - a.marketCap;
      case 'roe':
        return b.roe - a.roe;
      case 'revenueGrowth':
        return b.revenueGrowth - a.revenueGrowth;
      case 'dividendYield':
        return b.dividendYield - a.dividendYield;
      case 'volumeRatio':
        return b.volumeRatio - a.volumeRatio;
      case 'changePercent30d':
        return a.changePercent30d - b.changePercent30d; // 跌幅大的排前面
      default:
        return b.score - a.score;
    }
  });
  
  return filtered;
}

// ========== 应用预设策略 ==========
async function applyStrategy(strategyId) {
  const strategy = PRESET_STRATEGIES[strategyId];
  
  if (!strategy) {
    throw new Error(`未找到策略: ${strategyId}`);
  }
  
  // 执行筛选
  const results = await filterStocks(strategy.filters);
  
  return {
    strategy: {
      id: strategy.id,
      name: strategy.name,
      icon: strategy.icon,
      description: strategy.description,
      targetUser: strategy.targetUser
    },
    results,
    count: results.length,
    timestamp: Date.now()
  };
}

// ========== 获取所有预设策略（含匹配数量）==========
async function getAllStrategiesWithCount() {
  const strategies = [];
  
  for (const [id, strategy] of Object.entries(PRESET_STRATEGIES)) {
    const results = await filterStocks(strategy.filters);
    
    strategies.push({
      id: strategy.id,
      name: strategy.name,
      icon: strategy.icon,
      description: strategy.description,
      targetUser: strategy.targetUser,
      count: results.length,
      topPicks: results.slice(0, 3).map(s => ({ // 前3只股票预览
        code: s.code,
        name: s.name,
        changePercent: s.changePercent,
        score: Math.round(s.score)
      }))
    });
  }
  
  return strategies;
}

// ========== 导出 ==========
module.exports = {
  PRESET_STRATEGIES,
  FILTER_DIMENSIONS,
  filterStocks,
  applyStrategy,
  getAllStrategiesWithCount,
  enrichStockData
};
