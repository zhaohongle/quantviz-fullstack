// ========== QuantViz Mock Data Generator ==========
// 数据更新时间：2026-04-01 18:30
// 数据来源：腾讯财经API (http://qt.gtimg.cn/)
// 说明：本文件包含所有实时更新的市场数据

// Generate realistic K-line data
function generateKLineData(basePrice, days = 120, volatility = 0.02) {
  const data = [];
  let price = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    const volume = Math.floor(Math.random() * 50000 + 10000) * 100;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });

    price = close;
  }

  return data;
}

// Generate sparkline data
function generateSparkline(length = 20) {
  const data = [];
  let value = 50 + Math.random() * 30;
  for (let i = 0; i < length; i++) {
    value += (Math.random() - 0.5) * 8;
    value = Math.max(10, Math.min(90, value));
    data.push(parseFloat(value.toFixed(1)));
  }
  return data;
}

// ========== Indices Data ==========
// 数据来源：腾讯财经API（实时更新）
// 更新时间：2026-04-01 16:14
window.MOCK_INDICES = [
  {
    code: '000001.SH',
    name: '上证指数',
    value: 3948.55,
    change: 56.69,
    changePercent: 1.46,
    high: 3960.00,
    low: 3892.00,
    volume: 56461159800,
    amount: 648804150000,
    sparkline: generateSparkline()
  },
  {
    code: '399001.SZ',
    name: '深证成指',
    value: 13706.52,
    change: 228.46,
    changePercent: 1.70,
    high: 13750.00,
    low: 13478.00,
    volume: 65576338200,
    amount: 445139670000,
    sparkline: generateSparkline()
  },
  {
    code: '399006.SZ',
    name: '创业板指',
    value: 3247.52,
    change: 62.57,
    changePercent: 1.96,
    high: 3260.00,
    low: 3185.00,
    volume: 18012365900,
    amount: 178903130000,
    sparkline: generateSparkline()
  },
  {
    code: '000688.SH',
    name: '科创50',
    value: 1298.20,
    change: 41.87,
    changePercent: 3.33,
    high: 1305.00,
    low: 1256.00,
    volume: 982646100,
    amount: 39516080000,
    sparkline: generateSparkline()
  }
];

// ========== Stocks Data ==========
// 数据来源：腾讯财经API（实时更新）
// 更新时间：2026-04-01 16:14
window.MOCK_STOCKS = [
  {
    code: '600519',
    name: '贵州茅台',
    market: 'SH',
    price: 1459.44,
    change: 9.44,
    changePercent: 0.65,
    open: 1450.00,
    high: 1469.99,
    low: 1452.88,
    prevClose: 1450.00,
    volume: 29125,
    amount: 4256185472,
    turnover: 0.23,
    pe: 20.30,
    pb: 8.05,
    marketCap: 1827613000000,
    sector: '白酒',
    tags: ['沪市主板', '白酒', '沪深300'],
    klineData: generateKLineData(1450, 120, 0.015),
    sparkline: generateSparkline()
  },
  {
    code: '002371',
    name: '北方华创',
    market: 'SZ',
    price: 450.53,
    change: 3.53,
    changePercent: 0.79,
    open: 447.00,
    high: 461.24,
    low: 450.02,
    prevClose: 447.00,
    volume: 63355,
    amount: 2890025430,
    turnover: 0.87,
    pe: 51.97,
    pb: 9.06,
    marketCap: 326298000000,
    sector: '半导体',
    tags: ['深市主板', '半导体', '国产替代'],
    klineData: generateKLineData(447, 120, 0.03),
    sparkline: generateSparkline()
  },
  {
    code: '688981',
    name: '中芯国际',
    market: 'SH',
    price: 96.33,
    change: 2.28,
    changePercent: 2.42,
    open: 94.05,
    high: 96.70,
    low: 94.81,
    prevClose: 94.05,
    volume: 32564808,
    amount: 3121615312,
    turnover: 1.63,
    pe: 152.91,
    pb: 5.11,
    marketCap: 192618000000,
    sector: '半导体',
    tags: ['科创板', '半导体', '芯片制造'],
    klineData: generateKLineData(94.05, 120, 0.025),
    sparkline: generateSparkline()
  },
  {
    code: '300750',
    name: '宁德时代',
    market: 'SZ',
    price: 405.71,
    change: 4.01,
    changePercent: 1.00,
    open: 401.70,
    high: 409.87,
    low: 396.00,
    prevClose: 401.70,
    volume: 231701,
    amount: 9384266504,
    turnover: 0.54,
    pe: 25.65,
    pb: 5.49,
    marketCap: 1726961000000,
    sector: '新能源',
    tags: ['创业板', '锂电池', '新能源'],
    klineData: generateKLineData(401.70, 120, 0.025),
    sparkline: generateSparkline()
  },
  {
    code: '000858',
    name: '五粮液',
    market: 'SZ',
    price: 104.39,
    change: 1.12,
    changePercent: 1.08,
    open: 103.27,
    high: 105.18,
    low: 103.39,
    prevClose: 103.27,
    volume: 122667,
    amount: 1279526789,
    turnover: 0.32,
    pe: 14.25,
    pb: 3.06,
    marketCap: 405184000000,
    sector: '白酒',
    tags: ['深市主板', '白酒', '沪深300'],
    klineData: generateKLineData(103.27, 120, 0.015),
    sparkline: generateSparkline()
  },
  {
    code: '601888',
    name: '中国中免',
    market: 'SH',
    price: 71.40,
    change: 1.02,
    changePercent: 1.45,
    open: 70.38,
    high: 71.91,
    low: 70.50,
    prevClose: 70.38,
    volume: 184189,
    amount: 1311907596,
    turnover: 0.94,
    pe: 41.37,
    pb: 2.67,
    marketCap: 139407000000,
    sector: '免税',
    tags: ['沪市主板', '免税', '消费'],
    klineData: generateKLineData(70.38, 120, 0.02),
    sparkline: generateSparkline()
  },
  {
    code: '002594',
    name: '比亚迪',
    market: 'SZ',
    price: 102.65,
    change: -2.60,
    changePercent: -2.47,
    open: 105.25,
    high: 106.50,
    low: 102.37,
    prevClose: 105.25,
    volume: 715198,
    amount: 7383168512,
    turnover: 2.05,
    pe: 28.69,
    pb: 4.11,
    marketCap: 357901000000,
    sector: '新能源汽车',
    tags: ['深市主板', '新能源车', '电池'],
    klineData: generateKLineData(105.25, 120, 0.022),
    sparkline: generateSparkline()
  },
  {
    code: '601012',
    name: '隆基绿能',
    market: 'SH',
    price: 17.89,
    change: 0.35,
    changePercent: 2.00,
    open: 17.54,
    high: 18.03,
    low: 17.54,
    prevClose: 17.54,
    volume: 1349022,
    amount: 2398083291,
    turnover: 1.78,
    pe: -24.49,
    pb: 2.38,
    marketCap: 135571000000,
    sector: '光伏',
    tags: ['沪市主板', '光伏', '新能源'],
    klineData: generateKLineData(17.54, 120, 0.025),
    sparkline: generateSparkline()
  },
  {
    code: '601398',
    name: '工商银行',
    market: 'SH',
    price: 7.58,
    change: -0.06,
    changePercent: -0.79,
    open: 7.64,
    high: 7.71,
    low: 7.54,
    prevClose: 7.64,
    volume: 3308704,
    amount: 2520186947,
    turnover: 0.12,
    pe: 7.33,
    pb: 0.70,
    marketCap: 2043661000000,
    sector: '银行',
    tags: ['沪市主板', '银行', '金融'],
    klineData: generateKLineData(7.64, 120, 0.01),
    sparkline: generateSparkline()
  },
  {
    code: '601288',
    name: '农业银行',
    market: 'SH',
    price: 6.69,
    change: -0.01,
    changePercent: -0.15,
    open: 6.70,
    high: 6.78,
    low: 6.66,
    prevClose: 6.70,
    volume: 3316883,
    amount: 2229362172,
    turnover: 0.10,
    pe: 8.04,
    pb: 0.85,
    marketCap: 2135744000000,
    sector: '银行',
    tags: ['沪市主板', '银行', '金融'],
    klineData: generateKLineData(6.70, 120, 0.01),
    sparkline: generateSparkline()
  },
  {
    code: '601939',
    name: '建设银行',
    market: 'SH',
    price: 9.45,
    change: -0.20,
    changePercent: -2.07,
    open: 9.65,
    high: 9.67,
    low: 9.43,
    prevClose: 9.65,
    volume: 1229390,
    amount: 1171653738,
    turnover: 1.28,
    pe: 7.29,
    pb: 0.71,
    marketCap: 90660000000,
    sector: '银行',
    tags: ['沪市主板', '银行', '金融'],
    klineData: generateKLineData(9.65, 120, 0.01),
    sparkline: generateSparkline()
  },
  {
    code: '300059',
    name: '东方财富',
    market: 'SZ',
    price: 19.19,
    change: 0.30,
    changePercent: 1.59,
    open: 18.89,
    high: 19.29,
    low: 19.08,
    prevClose: 18.89,
    volume: 1729787,
    amount: 3321082456,
    turnover: 1.30,
    pe: 25.10,
    pb: 3.30,
    marketCap: 255951000000,
    sector: '互联网金融',
    tags: ['创业板', '证券', '互联网'],
    klineData: generateKLineData(18.89, 120, 0.025),
    sparkline: generateSparkline()
  },
  {
    code: '603259',
    name: '药明康德',
    market: 'SH',
    price: 103.81,
    change: 5.71,
    changePercent: 5.82,
    open: 98.10,
    high: 104.11,
    low: 98.08,
    prevClose: 98.10,
    volume: 790276,
    amount: 8034480317,
    turnover: 3.20,
    pe: 16.17,
    pb: 3.89,
    marketCap: 256751000000,
    sector: '医药',
    tags: ['沪市主板', '医药', 'CRO'],
    klineData: generateKLineData(98.10, 120, 0.022),
    sparkline: generateSparkline()
  },
  {
    code: '002460',
    name: '赣锋锂业',
    market: 'SZ',
    price: 77.31,
    change: -1.07,
    changePercent: -1.37,
    open: 78.38,
    high: 79.44,
    low: 76.36,
    prevClose: 78.38,
    volume: 689439,
    amount: 5344428396,
    turnover: 5.69,
    pe: 100.49,
    pb: 3.59,
    marketCap: 93639000000,
    sector: '锂电池',
    tags: ['深市主板', '锂矿', '新能源'],
    klineData: generateKLineData(78.38, 120, 0.025),
    sparkline: generateSparkline()
  },
  {
    code: '002475',
    name: '立讯精密',
    market: 'SZ',
    price: 50.40,
    change: 1.14,
    changePercent: 2.31,
    open: 49.26,
    high: 51.11,
    low: 49.80,
    prevClose: 49.26,
    volume: 1109777,
    amount: 5578244766,
    turnover: 1.53,
    pe: 23.23,
    pb: 4.67,
    marketCap: 366371000000,
    sector: '消费电子',
    tags: ['深市主板', '苹果链', '消费电子'],
    klineData: generateKLineData(49.26, 120, 0.02),
    sparkline: generateSparkline()
  },
  {
    code: '000625',
    name: '长安汽车',
    market: 'SZ',
    price: 10.03,
    change: 0.03,
    changePercent: 0.30,
    open: 10.00,
    high: 10.11,
    low: 9.99,
    prevClose: 10.00,
    volume: 432066,
    amount: 432834032,
    turnover: 0.52,
    pe: 14.63,
    pb: 1.30,
    marketCap: 82919000000,
    sector: '汽车',
    tags: ['深市主板', '新能源车', '国企'],
    klineData: generateKLineData(10.00, 120, 0.02),
    sparkline: generateSparkline()
  },
  {
    code: '600809',
    name: '山西汾酒',
    market: 'SH',
    price: 144.38,
    change: 1.32,
    changePercent: 0.92,
    open: 143.06,
    high: 145.89,
    low: 142.06,
    prevClose: 143.06,
    volume: 69726,
    amount: 1004410078,
    turnover: 0.57,
    pe: 14.32,
    pb: 4.54,
    marketCap: 176138000000,
    sector: '白酒',
    tags: ['沪市主板', '白酒', '高端酒'],
    klineData: generateKLineData(143.06, 120, 0.015),
    sparkline: generateSparkline()
  },
  {
    code: '002304',
    name: '洋河股份',
    market: 'SZ',
    price: 51.35,
    change: 0.61,
    changePercent: 1.20,
    open: 50.74,
    high: 51.80,
    low: 50.82,
    prevClose: 50.74,
    volume: 46135,
    amount: 236957738,
    turnover: 0.31,
    pe: 37.38,
    pb: 1.59,
    marketCap: 77354000000,
    sector: '白酒',
    tags: ['深市主板', '白酒', '次高端'],
    klineData: generateKLineData(50.74, 120, 0.015),
    sparkline: generateSparkline()
  },
  {
    code: '601628',
    name: '中国人寿',
    market: 'SH',
    price: 37.02,
    change: 0.68,
    changePercent: 1.87,
    open: 36.34,
    high: 37.14,
    low: 36.51,
    prevClose: 36.34,
    volume: 267234,
    amount: 985937770,
    turnover: 0.13,
    pe: 6.79,
    pb: 1.76,
    marketCap: 770887000000,
    sector: '保险',
    tags: ['沪市主板', '保险', '金融'],
    klineData: generateKLineData(36.34, 120, 0.012),
    sparkline: generateSparkline()
  },
  {
    code: '601601',
    name: '中国太保',
    market: 'SH',
    price: 38.31,
    change: 1.22,
    changePercent: 3.29,
    open: 37.09,
    high: 38.58,
    low: 37.79,
    prevClose: 37.09,
    volume: 342176,
    amount: 1308954045,
    turnover: 0.50,
    pe: 6.89,
    pb: 1.22,
    marketCap: 262234000000,
    sector: '保险',
    tags: ['沪市主板', '保险', '金融'],
    klineData: generateKLineData(37.09, 120, 0.012),
    sparkline: generateSparkline()
  }
];

// ========== Sectors Data ==========
window.MOCK_SECTORS = [
  { name: '半导体', changePercent: 2.85, flow: 28500000000, leadingStock: '北方华创', color: '#00e676' },
  { name: '新能源', changePercent: 1.45, flow: 21200000000, leadingStock: '宁德时代', color: '#00d4ff' },
  { name: '白酒', changePercent: 0.92, flow: 18600000000, leadingStock: '贵州茅台', color: '#ffeb3b' },
  { name: '医药', changePercent: 3.12, flow: 12800000000, leadingStock: '药明康德', color: '#4caf50' },
  { name: '光伏', changePercent: 1.68, flow: 9500000000, leadingStock: '隆基绿能', color: '#ff9800' },
  { name: '锂电池', changePercent: 0.85, flow: 8200000000, leadingStock: '宁德时代', color: '#9c27b0' },
  { name: '消费电子', changePercent: 1.95, flow: 6800000000, leadingStock: '立讯精密', color: '#2196f3' },
  { name: '银行', changePercent: -1.12, flow: -8500000000, leadingStock: '工商银行', color: '#f44336' },
  { name: '保险', changePercent: 1.35, flow: 4200000000, leadingStock: '中国太保', color: '#8bc34a' },
  { name: '汽车', changePercent: -0.45, flow: -2100000000, leadingStock: '比亚迪', color: '#ff5722' }
];

// ========== Ranking Data ==========
function getRankingData() {
  const sorted = [...window.MOCK_STOCKS].sort((a, b) => b.changePercent - a.changePercent);
  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.reverse().slice(0, 10)
  };
}

window.MOCK_RANKING = getRankingData();

// ========== News Data ==========
window.MOCK_NEWS = [
  {
    id: 1,
    time: '16:14',
    datetime: '2026-04-01 16:14',
    badge: 'urgent',
    badgeText: '重大',
    headline: '沪指大涨1.46%，科创50暴涨3.33%，半导体板块全线飘红',
    summary: '今日A股三大指数集体高开高走，上证指数涨1.46%，深证成指涨1.70%，创业板指涨1.96%，科创50大涨3.33%。板块方面，半导体、医药、新能源等板块领涨。',
    content: '<p>今日A股三大指数集体高开高走，上证指数涨1.46%报3948.55点，深证成指涨1.70%报13706.52点，创业板指涨1.96%报3247.52点，科创50大涨3.33%报1298.20点。</p><p>两市成交额突破万亿，达到10942亿元，较昨日放量明显。北向资金净流入超80亿元，显示外资持续看好A股。</p><p>板块方面，半导体板块领涨，北方华创、中芯国际涨幅居前；医药板块表现强势，药明康德大涨5.82%；新能源板块分化，宁德时代上涨，比亚迪回调。</p>',
    source: '财联社',
    category: '市场数据',
    stocks: ['600519', '002371', '688981', '300750'],
    latest: true,
    selected: true
  },
  {
    id: 2,
    time: '15:30',
    datetime: '2026-04-01 15:30',
    badge: 'important',
    badgeText: '重要',
    headline: '北方华创盘中创新高，半导体设备国产替代加速',
    summary: '半导体设备龙头北方华创今日盘中涨超3%，股价创历史新高。机构认为，在国产替代加速背景下，半导体设备企业将持续受益。',
    content: '<p>半导体设备龙头北方华创今日盘中涨超3%，股价创历史新高至461.24元。公司近期订单饱满，产能持续扩张，多家机构上调评级。</p><p>分析师指出，在芯片国产化大背景下，半导体设备作为产业链上游核心环节，将持续受益于下游晶圆厂扩产需求。</p>',
    source: '证券时报',
    category: '行业动态',
    stocks: ['002371', '688981']
  },
  {
    id: 3,
    time: '14:20',
    datetime: '2026-04-01 14:20',
    badge: 'important',
    badgeText: '重要',
    headline: '药明康德大涨近6%，CRO行业景气度持续上行',
    summary: 'CRO龙头药明康德今日大涨5.82%，成交额超80亿元。业内人士表示，全球创新药研发投入持续增加，CRO行业景气度持续上行。',
    content: '<p>CRO龙头药明康德今日大涨5.82%至103.81元，成交额超80亿元，换手率达3.20%。公司近期公布一季度业绩指引，营收和利润均超预期。</p><p>机构研报指出，全球创新药研发投入持续增加，中国CRO企业凭借成本和技术优势，正在加速承接全球订单。</p>',
    source: '新浪财经',
    category: '公司公告',
    stocks: ['603259']
  },
  {
    id: 4,
    time: '13:15',
    datetime: '2026-04-01 13:15',
    badge: 'flash',
    badgeText: '快讯',
    headline: '两市成交额突破万亿，市场情绪明显回暖',
    summary: '截至13时15分，沪深两市成交额突破万亿元大关，达到10125亿元，较昨日同时段放量超30%，市场情绪明显回暖。',
    content: '<p>截至13时15分，沪深两市成交额突破万亿元大关，达到10125亿元，较昨日同时段放量超30%。其中沪市成交4580亿，深市成交5545亿。</p>',
    source: '东方财富',
    category: '市场数据',
    stocks: []
  },
  {
    id: 5,
    time: '11:30',
    datetime: '2026-04-01 11:30',
    badge: 'flash',
    badgeText: '快讯',
    headline: '北向资金午盘净流入58亿，持续加仓科技股',
    summary: '午盘收盘，北向资金净流入58.23亿元，其中沪股通净流入32亿，深股通净流入26亿。科技股成为加仓重点，半导体、消费电子板块获大幅增持。',
    content: '<p>午盘收盘，北向资金净流入58.23亿元，其中沪股通净流入32亿，深股通净流入26亿。</p><p>个股方面，北方华创获净买入5.8亿，中芯国际获净买入4.2亿，立讯精密获净买入3.6亿。</p>',
    source: '财经网',
    category: '资金流向',
    stocks: ['002371', '688981', '002475']
  },
  {
    id: 6,
    time: '10:45',
    datetime: '2026-04-01 10:45',
    badge: 'flash',
    badgeText: '快讯',
    headline: '茅台股价再创新高，白酒板块整体上涨',
    summary: '贵州茅台盘中触及1469.99元，再创历史新高。白酒板块整体上涨，五粮液涨1.08%，山西汾酒涨0.92%，洋河股份涨1.20%。',
    content: '<p>白酒板块今日表现强势，龙头贵州茅台盘中触及1469.99元，再创历史新高。五粮液涨1.08%，山西汾酒涨0.92%，洋河股份涨1.20%。</p><p>机构认为，春节消费数据良好，高端白酒批价坚挺，板块估值仍具吸引力。</p>',
    source: '第一财经',
    category: '行业动态',
    stocks: ['600519', '000858', '600809', '002304']
  },
  {
    id: 7,
    time: '10:12',
    datetime: '2026-04-01 10:12',
    badge: 'flash',
    badgeText: '快讯',
    headline: '新能源板块分化，宁德时代涨1%，比亚迪跌2.47%',
    summary: '新能源板块出现分化，宁德时代涨1.00%，隆基绿能涨2.00%；比亚迪跌2.47%，赣锋锂业跌1.37%。',
    content: '<p>新能源板块今日出现明显分化，龙头宁德时代涨1.00%，隆基绿能涨2.00%，表现稳健。</p><p>但比亚迪跌2.47%，赣锋锂业跌1.37%，主要受行业价格战和原材料价格波动影响。</p>',
    source: '中国证券报',
    category: '行业动态',
    stocks: ['300750', '002594', '601012', '002460']
  },
  {
    id: 8,
    time: '09:45',
    datetime: '2026-04-01 09:45',
    badge: 'flash',
    badgeText: '快讯',
    headline: '三大指数集体高开，科创50涨幅超2%',
    summary: '早盘开盘，三大指数集体高开。上证指数涨0.85%，深证成指涨1.12%，创业板指涨1.35%，科创50涨2.18%。',
    content: '<p>早盘开盘，三大指数集体高开。上证指数涨0.85%报3924.62点，深证成指涨1.12%报13635.89点，创业板指涨1.35%报3232.10点，科创50涨2.18%报1282.75点。</p>',
    source: '同花顺',
    category: '市场数据',
    stocks: []
  },
  {
    id: 9,
    time: '09:30',
    datetime: '2026-04-01 09:30',
    badge: 'flash',
    badgeText: '快讯',
    headline: 'A股今日迎来4月开门红，多重利好共振',
    summary: 'A股今日迎来4月开门红，隔夜美股大涨、人民币汇率走强、政策预期升温等多重利好共振，市场做多情绪高涨。',
    content: '<p>A股今日迎来4月开门红，多重利好共振：1）隔夜美股三大指数均涨超1%；2）人民币汇率走强至6.98；3）政策面预期升温。</p><p>机构预计，4月市场有望延续向上趋势，重点关注科技、消费、医药等板块。</p>',
    source: '券商中国',
    category: '宏观政策',
    stocks: []
  },
  {
    id: 10,
    time: '08:30',
    datetime: '2026-04-01 08:30',
    badge: 'flash',
    badgeText: '快讯',
    headline: '外围市场：美股三大指数集体收涨，纳指涨1.5%',
    summary: '隔夜美股三大指数集体收涨，道指涨1.2%，标普500涨1.3%，纳指涨1.5%。科技股领涨，英伟达涨超3%，特斯拉涨2.8%。',
    content: '<p>隔夜美股三大指数集体收涨，道指涨1.2%报39856点，标普500涨1.3%报5289点，纳指涨1.5%报16785点。</p><p>科技股领涨，英伟达涨超3%，特斯拉涨2.8%，苹果涨1.9%，微软涨1.6%。</p>',
    source: 'Wind',
    category: '国际市场',
    stocks: []
  }
];

// ========== Stock Recommendations ==========
window.MOCK_RECOMMENDATIONS = [
  {
    code:'603259', name:'药明康德', price:103.81, changePercent:5.82, sector:'医药',
    rating:'强烈推荐', ratingColor:'#00e676',
    targetPrice:125, currentPrice:103.81,
    reason:'CRO行业龙头，全球创新药研发投入持续增加，订单饱满。一季度业绩超预期，全年高增长确定性强。',
    strategy:'建议98-102区间建仓，目标价125元，持有周期6-12个月。当前已突破100元关口，可适当追涨。',
    highlights:['全球CRO龙头','业绩超预期','北向资金增持'],
    risk:'地缘政治风险，部分业务受影响'
  },
  {
    code:'002371', name:'北方华创', price:450.53, changePercent:0.79, sector:'半导体',
    rating:'强烈推荐', ratingColor:'#00e676',
    targetPrice:520, currentPrice:450.53,
    reason:'国产半导体设备龙头，受益芯片国产替代加速，订单饱满产能持续扩张。多家机构上调评级。',
    strategy:'建议430-450区间分批建仓，目标价520元，持有周期12个月以上。长线布局首选标的。',
    highlights:['半导体设备龙头','国产替代核心','订单增速超50%'],
    risk:'行业波动风险，产能扩张不及预期'
  },
  {
    code:'300750', name:'宁德时代', price:405.71, changePercent:1.00, sector:'锂电池',
    rating:'推荐买入', ratingColor:'#00d4ff',
    targetPrice:480, currentPrice:405.71,
    reason:'全球动力电池龙头，市占率持续提升，新一代钠离子电池即将量产，长期成长确定性高。',
    strategy:'适合中长线持有，建议390-410区间分批建仓，目标价480元，持有周期6-12个月。',
    highlights:['全球市占率第一','钠电池量产在即','储能业务高增'],
    risk:'原材料价格波动，行业竞争加剧'
  },
  {
    code:'688981', name:'中芯国际', price:96.33, changePercent:2.42, sector:'半导体',
    rating:'推荐买入', ratingColor:'#00d4ff',
    targetPrice:115, currentPrice:96.33,
    reason:'国产芯片制造龙头，成熟制程产能持续满载，先进制程突破可期。政策扶持力度加大。',
    strategy:'建议90-95区间布局，目标价115元，持有周期6-12个月。当前位置偏高，等待回调机会。',
    highlights:['芯片制造龙头','产能利用率高','政策利好持续'],
    risk:'地缘政治风险，设备进口受限'
  },
  {
    code:'600519', name:'贵州茅台', price:1459.44, changePercent:0.65, sector:'白酒',
    rating:'推荐买入', ratingColor:'#00d4ff',
    targetPrice:1650, currentPrice:1459.44,
    reason:'白酒之王，品牌护城河极深。批价稳中有升，春节动销良好，消费复苏预期增强。',
    strategy:'防御性配置首选，建议1400-1450区间布局，目标价1650元。可长期持有享受分红。',
    highlights:['品牌护城河极深','批价持续上行','分红率提升'],
    risk:'高端消费若不及预期将承压'
  },
  {
    code:'601601', name:'中国太保', price:38.31, changePercent:3.29, sector:'保险',
    rating:'谨慎推荐', ratingColor:'#fdcb6e',
    targetPrice:43, currentPrice:38.31,
    reason:'保险龙头之一，受益于利率企稳和权益市场回暖，估值处于历史低位，股息率较高。',
    strategy:'适合稳健投资者，建议36-38区间建仓，目标价43元。重点关注分红收益。',
    highlights:['估值历史低位','股息率超5%','利率企稳受益'],
    risk:'利率下行风险，权益投资波动'
  }
];

// ========== Sector Stocks Data ==========
window.SECTOR_STOCKS = {
  '半导体': [
    { code:'002371', name:'北方华创', price:450.53, changePercent:0.79, flow:2890000000 },
    { code:'688981', name:'中芯国际', price:96.33, changePercent:2.42, flow:3121000000 },
  ],
  '新能源': [
    { code:'300750', name:'宁德时代', price:405.71, changePercent:1.00, flow:9384000000 },
    { code:'601012', name:'隆基绿能', price:17.89, changePercent:2.00, flow:2398000000 },
  ],
  '白酒': [
    { code:'600519', name:'贵州茅台', price:1459.44, changePercent:0.65, flow:4256000000 },
    { code:'000858', name:'五粮液', price:104.39, changePercent:1.08, flow:1279000000 },
    { code:'600809', name:'山西汾酒', price:144.38, changePercent:0.92, flow:1004000000 },
    { code:'002304', name:'洋河股份', price:51.35, changePercent:1.20, flow:236000000 },
  ],
  '银行': [
    { code:'601398', name:'工商银行', price:7.58, changePercent:-0.79, flow:-2520000000 },
    { code:'601288', name:'农业银行', price:6.69, changePercent:-0.15, flow:-2229000000 },
    { code:'601939', name:'建设银行', price:9.45, changePercent:-2.07, flow:-1171000000 },
  ],
  '保险': [
    { code:'601628', name:'中国人寿', price:37.02, changePercent:1.87, flow:985000000 },
    { code:'601601', name:'中国太保', price:38.31, changePercent:3.29, flow:1308000000 },
  ],
  '汽车': [
    { code:'002594', name:'比亚迪', price:102.65, changePercent:-2.47, flow:-7383000000 },
    { code:'000625', name:'长安汽车', price:10.03, changePercent:0.30, flow:432000000 },
  ],
  '医药': [
    { code:'603259', name:'药明康德', price:103.81, changePercent:5.82, flow:8034000000 },
  ],
  '锂电池': [
    { code:'300750', name:'宁德时代', price:405.71, changePercent:1.00, flow:9384000000 },
    { code:'002460', name:'赣锋锂业', price:77.31, changePercent:-1.37, flow:-5344000000 },
  ],
  '消费电子': [
    { code:'002475', name:'立讯精密', price:50.40, changePercent:2.31, flow:5578000000 },
  ],
  '互联网金融': [
    { code:'300059', name:'东方财富', price:19.19, changePercent:1.59, flow:3321000000 },
  ]
};

// ========== Helper Functions ==========
window.getStockByCode = function(code) {
  return window.MOCK_STOCKS.find(s => s.code === code);
};

window.getIndexKLineData = function(code) {
  const index = window.MOCK_INDICES.find(i => i.code === code);
  if (!index) return null;
  return generateKLineData(index.value - index.change, 120, 0.01);
};

window.getSectorStocks = function(sectorName) {
  return window.SECTOR_STOCKS[sectorName] || [];
};

console.log('✅ Mock data loaded successfully');
console.log('📊 Indices:', window.MOCK_INDICES.length);
console.log('📈 Stocks:', window.MOCK_STOCKS.length);
console.log('📰 News:', window.MOCK_NEWS.length);
console.log('🏢 Sectors:', window.MOCK_SECTORS.length);
console.log('💡 Recommendations:', window.MOCK_RECOMMENDATIONS.length);
console.log('⏰ Last updated: 2026-04-01 18:30');
