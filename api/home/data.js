// Vercel Serverless Function: Home Data (Global Indices + News)
const mockGlobalIndices = [
  {
    code: "000001.SH",
    name: "上证指数",
    market: "CN",
    value: 3280.52,
    price: 3280.52,
    change: -12.35,
    changePercent: -0.38,
    open: 3290.00,
    high: 3295.80,
    low: 3275.20,
    preClose: 3292.87,
    volume: 285000000,
    amount: 32100000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "399001.SZ",
    name: "深证成指",
    market: "CN",
    value: 11250.68,
    price: 11250.68,
    change: 25.30,
    changePercent: 0.23,
    open: 11220.00,
    high: 11275.50,
    low: 11210.30,
    preClose: 11225.38,
    volume: 195000000,
    amount: 23500000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "399006.SZ",
    name: "创业板指",
    market: "CN",
    value: 2380.95,
    price: 2380.95,
    change: 15.60,
    changePercent: 0.66,
    open: 2365.00,
    high: 2385.20,
    low: 2362.80,
    preClose: 2365.35,
    volume: 125000000,
    amount: 15800000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^DJI",
    name: "道琼斯",
    market: "US",
    value: 38250.50,
    price: 38250.50,
    change: 180.25,
    changePercent: 0.47,
    open: 38100.00,
    high: 38280.30,
    low: 38050.80,
    preClose: 38070.25,
    volume: 350000000,
    amount: 12500000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^IXIC",
    name: "纳斯达克",
    market: "US",
    value: 15820.35,
    price: 15820.35,
    change: 95.60,
    changePercent: 0.61,
    open: 15750.00,
    high: 15850.20,
    low: 15720.50,
    preClose: 15724.75,
    volume: 480000000,
    amount: 18200000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^GSPC",
    name: "标普500",
    market: "US",
    value: 5050.25,
    price: 5050.25,
    change: 28.50,
    changePercent: 0.57,
    open: 5025.00,
    high: 5058.30,
    low: 5020.80,
    preClose: 5021.75,
    volume: 420000000,
    amount: 15600000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^HSI",
    name: "恒生指数",
    market: "HK",
    value: 18560.80,
    price: 18560.80,
    change: -85.20,
    changePercent: -0.46,
    open: 18650.00,
    high: 18680.50,
    low: 18520.30,
    preClose: 18646.00,
    volume: 95000000,
    amount: 12800000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^N225",
    name: "日经225",
    market: "JP",
    value: 38950.60,
    price: 38950.60,
    change: 125.40,
    changePercent: 0.32,
    open: 38820.00,
    high: 38980.20,
    low: 38800.50,
    preClose: 38825.20,
    volume: 185000000,
    amount: 8500000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^FTSE",
    name: "富时100",
    market: "UK",
    value: 7850.35,
    price: 7850.35,
    change: 35.60,
    changePercent: 0.46,
    open: 7820.00,
    high: 7865.80,
    low: 7810.20,
    preClose: 7814.75,
    volume: 125000000,
    amount: 5200000000,
    updateTime: new Date().toISOString()
  },
  {
    code: "^GDAXI",
    name: "德国DAX",
    market: "DE",
    value: 17980.50,
    price: 17980.50,
    change: 85.30,
    changePercent: 0.48,
    open: 17900.00,
    high: 18010.20,
    low: 17880.60,
    preClose: 17895.20,
    volume: 95000000,
    amount: 4500000000,
    updateTime: new Date().toISOString()
  }
];

const mockNews = [
  {
    id: "news1",
    headline: "A股三大指数涨跌互现，创业板指涨0.66%",
    title: "A股三大指数涨跌互现，创业板指涨0.66%",
    summary: "今日A股三大指数开盘涨跌互现，截至收盘，上证指数跌0.38%，深证成指涨0.23%，创业板指涨0.66%。",
    time: "15:05",
    datetime: new Date().toISOString(),
    source: "东方财富"
  },
  {
    id: "news2",
    headline: "科技股午后发力，芯片板块领涨",
    title: "科技股午后发力，芯片板块领涨",
    summary: "科技股午后发力，芯片板块领涨，龙头股涨幅超5%。",
    time: "14:30",
    datetime: new Date().toISOString(),
    source: "新浪财经"
  },
  {
    id: "news3",
    headline: "央行今日开展1000亿元逆回购操作",
    title: "央行今日开展1000亿元逆回购操作",
    summary: "央行今日开展1000亿元7天期逆回购操作，中标利率为1.80%。",
    time: "09:30",
    datetime: new Date().toISOString(),
    source: "中国证券报"
  },
  {
    id: "news4",
    headline: "美股三大指数集体收涨，纳指涨0.61%",
    title: "美股三大指数集体收涨，纳指涨0.61%",
    summary: "美股三大指数集体收涨，道琼斯涨0.47%，纳指涨0.61%，标普500涨0.57%。",
    time: "昨日",
    datetime: new Date(Date.now() - 86400000).toISOString(),
    source: "新浪财经"
  },
  {
    id: "news5",
    headline: "茅台发布一季度业绩预告，净利润同比增长15%",
    title: "茅台发布一季度业绩预告，净利润同比增长15%",
    summary: "贵州茅台发布一季度业绩预告，预计净利润同比增长15%左右。",
    time: "昨日",
    datetime: new Date(Date.now() - 86400000).toISOString(),
    source: "证券时报"
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // 返回 Mock 数据（生产环境可接入真实 API）
    res.status(200).json({
      indices: mockGlobalIndices,
      news: mockNews,
      lastUpdate: Date.now(),
      updateTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    });
  } catch (error) {
    res.status(500).json({
      error: '获取首页数据失败',
      message: error.message
    });
  }
};
