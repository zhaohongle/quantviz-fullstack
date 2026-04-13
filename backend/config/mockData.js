// ========================================
// 模拟数据库（用于测试）
// ========================================

// 模拟指数数据
const mockIndices = [
  {
    id: 1,
    symbol: 'sh000001',
    name: '上证指数',
    market: 'CN',
    display_order: 1,
    current_price: 3970.50,
    change_amount: -15.72,
    change_percent: -0.39,
    open_price: 3985.00,
    high_price: 3995.00,
    low_price: 3960.00,
    close_price: 3986.22,
    volume: 28500000000,
    amount: 350000000000,
    quote_time: new Date()
  },
  {
    id: 2,
    symbol: 'sz399001',
    name: '深证成指',
    market: 'CN',
    display_order: 2,
    current_price: 12350.80,
    change_amount: 25.30,
    change_percent: 0.21,
    open_price: 12320.00,
    high_price: 12380.00,
    low_price: 12310.00,
    close_price: 12325.50,
    volume: 18500000000,
    amount: 250000000000,
    quote_time: new Date()
  },
  {
    id: 3,
    symbol: 'sz399006',
    name: '创业板指',
    market: 'CN',
    display_order: 3,
    current_price: 2580.90,
    change_amount: 12.50,
    change_percent: 0.49,
    open_price: 2568.00,
    high_price: 2590.00,
    low_price: 2565.00,
    close_price: 2568.40,
    volume: 12500000000,
    amount: 180000000000,
    quote_time: new Date()
  }
];

// 模拟K线数据
const mockKlines = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const basePrice = 3970 + Math.random() * 100;
  
  return {
    kline_time: date,
    open_price: basePrice,
    high_price: basePrice + Math.random() * 30,
    low_price: basePrice - Math.random() * 30,
    close_price: basePrice + (Math.random() - 0.5) * 40,
    volume: Math.floor(Math.random() * 50000000000),
    amount: Math.floor(Math.random() * 500000000000)
  };
});

// 模拟资讯数据
const mockNews = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `重要资讯 ${i + 1}: 市场动态分析`,
  summary: '这是一条重要的市场资讯摘要...',
  source: '新浪财经',
  source_url: `https://finance.sina.com.cn/news/${i + 1}.html`,
  author: '财经记者',
  publish_time: new Date(Date.now() - i * 3600000),
  category: '股市',
  tags: ['市场', '分析'],
  related_symbols: ['sh000001', 'sz399001'],
  view_count: Math.floor(Math.random() * 10000),
  is_important: i < 3
}));

// 模拟板块数据
const mockSectors = Array.from({ length: 10 }, (_, i) => ({
  code: `BK${String(i + 1).padStart(4, '0')}`,
  name: ['银行', '证券', '保险', '房地产', '医药生物', '电子', '计算机', '通信', '汽车', '新能源'][i],
  type: i < 5 ? 'industry' : 'concept',
  main_inflow: (Math.random() - 0.5) * 100000,
  super_inflow: (Math.random() - 0.5) * 50000,
  large_inflow: (Math.random() - 0.5) * 50000,
  change_percent: (Math.random() - 0.5) * 10,
  total_amount: Math.random() * 1000000,
  leading_stock: null,
  flow_date: new Date().toISOString().split('T')[0],
  flow_time: new Date().toTimeString().split(' ')[0]
}));

module.exports = {
  mockIndices,
  mockKlines,
  mockNews,
  mockSectors
};
