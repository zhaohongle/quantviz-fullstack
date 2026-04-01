// ========== 数据抓取模块 ==========
// 从腾讯财经API抓取实时股票数据

const axios = require('axios');
const iconv = require('iconv-lite');

// 配置
const TENCENT_API = 'http://qt.gtimg.cn/q=';
const STOCK_CODES = [
  'sh600519', 'sz002371', 'sh688981', 'sz300750', 'sz000858', 'sh601888',
  'sz002594', 'sh601012', 'sh601398', 'sh601288', 'sh601939', 'sz300059',
  'sh603259', 'sz002460', 'sz002475', 'sz000625', 'sh600809', 'sz002304',
  'sh601628', 'sh601601'
];

// ========== 抓取指数数据 ==========
async function fetchIndices() {
  try {
    // 使用完整版API（不带s_前缀）获取详细数据
    const codes = 'sh000001,sz399001,sz399006,sh000688';
    const response = await axios.get(`${TENCENT_API}${codes}`, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const data = iconv.decode(response.data, 'gbk');
    const indices = [];
    
    // 解析数据
    const lines = data.trim().split('\n');
    for (const line of lines) {
      const match = line.match(/v_(\w+)="(.+?)";/);
      if (!match) continue;
      
      const code = match[1];
      const fields = match[2].split('~');
      
      // 字段说明：
      // fields[3] = 当前价
      // fields[4] = 昨收
      // fields[5] = 今开
      // fields[6] = 成交量
      // fields[31] = 时间戳
      // fields[32] = 涨跌
      // fields[33] = 涨跌幅
      // fields[33] = 最高
      // fields[34] = 最低
      
      const current = parseFloat(fields[3]);
      const prevClose = parseFloat(fields[4]);
      const change = current - prevClose;
      const changePercent = (change / prevClose) * 100;
      
      const index = {
        code: formatIndexCode(code),
        name: fields[1],
        value: current,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: parseInt(fields[6]),
        amount: parseFloat(fields[37]) * 100000000, // 成交额（亿）
        high: parseFloat(fields[33]) || current,    // 最高价
        low: parseFloat(fields[34]) || current       // 最低价
      };
      
      indices.push(index);
    }
    
    return indices;
  } catch (error) {
    console.error('抓取指数失败:', error.message);
    return [];
  }
}

// ========== 抓取股票数据 ==========
async function fetchStocks() {
  try {
    const codes = STOCK_CODES.join(',');
    const response = await axios.get(`${TENCENT_API}${codes}`, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    
    const data = iconv.decode(response.data, 'gbk');
    const stocks = [];
    
    const lines = data.trim().split('\n');
    for (const line of lines) {
      const match = line.match(/v_(\w+)="(.+?)";/);
      if (!match) continue;
      
      const fullCode = match[1];
      const fields = match[2].split('~');
      
      const stock = {
        code: fullCode.slice(2),
        name: fields[1],
        market: fullCode.startsWith('sh') ? 'SH' : 'SZ',
        price: parseFloat(fields[3]),
        change: parseFloat(fields[31]),
        changePercent: parseFloat(fields[32]),
        open: parseFloat(fields[5]),
        high: parseFloat(fields[33]),
        low: parseFloat(fields[34]),
        prevClose: parseFloat(fields[4]),
        volume: parseInt(fields[36]),
        amount: parseFloat(fields[37]),
        turnover: parseFloat(fields[38]),
        pe: parseFloat(fields[39]) || 0,
        pb: parseFloat(fields[46]) || 0,
        marketCap: parseFloat(fields[45]) || 0,
        sector: getSector(fields[1]),
        tags: getTags(fullCode, fields[1])
      };
      
      stocks.push(stock);
    }
    
    return stocks;
  } catch (error) {
    console.error('抓取股票失败:', error.message);
    return [];
  }
}

// ========== 生成板块数据 ==========
async function fetchSectors() {
  const stocks = await fetchStocks();
  const sectorMap = {};
  
  // 按板块聚合
  for (const stock of stocks) {
    if (!sectorMap[stock.sector]) {
      sectorMap[stock.sector] = {
        stocks: [],
        totalFlow: 0
      };
    }
    sectorMap[stock.sector].stocks.push(stock);
    sectorMap[stock.sector].totalFlow += stock.amount * (stock.changePercent > 0 ? 1 : -1);
  }
  
  // 生成板块列表
  const sectors = [];
  for (const [name, data] of Object.entries(sectorMap)) {
    const avgChange = data.stocks.reduce((sum, s) => sum + s.changePercent, 0) / data.stocks.length;
    const leadingStock = data.stocks.sort((a, b) => b.changePercent - a.changePercent)[0];
    
    sectors.push({
      name,
      changePercent: parseFloat(avgChange.toFixed(2)),
      flow: Math.round(data.totalFlow),
      leadingStock: leadingStock.name,
      color: avgChange > 0 ? '#00e676' : '#ff5252'
    });
  }
  
  return sectors.sort((a, b) => b.changePercent - a.changePercent);
}

// ========== 生成新闻 ==========
async function generateNews() {
  const indices = await fetchIndices();
  const stocks = await fetchStocks();
  const sectors = await fetchSectors();
  
  const news = [];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  // 生成大盘新闻
  if (indices[0]) {
    const sh = indices[0];
    news.push({
      id: 1,
      time: timeStr,
      datetime: now.toISOString(),
      badge: sh.changePercent > 1 ? 'urgent' : 'important',
      badgeText: sh.changePercent > 1 ? '重大' : '重要',
      headline: `上证指数${sh.changePercent > 0 ? '上涨' : '下跌'}${Math.abs(sh.changePercent).toFixed(2)}%，报${sh.value.toFixed(2)}点`,
      summary: `今日上证指数${sh.changePercent > 0 ? '收涨' : '收跌'}${Math.abs(sh.changePercent).toFixed(2)}%，成交额${(sh.amount/100000000).toFixed(0)}亿元。`,
      content: `<p>今日上证指数${sh.changePercent > 0 ? '收涨' : '收跌'}${Math.abs(sh.changePercent).toFixed(2)}%，报${sh.value.toFixed(2)}点，成交额${(sh.amount/100000000).toFixed(0)}亿元。</p>`,
      source: 'QuantViz实时',
      category: '市场数据',
      stocks: [],
      latest: true,
      selected: true
    });
  }
  
  // 生成板块新闻
  if (sectors[0] && Math.abs(sectors[0].changePercent) > 1) {
    news.push({
      id: 2,
      time: timeStr,
      datetime: now.toISOString(),
      badge: 'important',
      badgeText: '重要',
      headline: `${sectors[0].name}板块${sectors[0].changePercent > 0 ? '领涨' : '领跌'}，${sectors[0].leadingStock}涨幅居前`,
      summary: `${sectors[0].name}板块今日表现${sectors[0].changePercent > 0 ? '强势' : '疲软'}，平均涨幅${sectors[0].changePercent.toFixed(2)}%。`,
      source: 'QuantViz实时',
      category: '行业动态',
      stocks: []
    });
  }
  
  // 生成个股新闻（涨幅超5%）
  const topStocks = stocks.filter(s => s.changePercent > 5).slice(0, 3);
  for (const stock of topStocks) {
    news.push({
      id: news.length + 1,
      time: timeStr,
      datetime: now.toISOString(),
      badge: 'flash',
      badgeText: '快讯',
      headline: `${stock.name}大涨${stock.changePercent.toFixed(2)}%，成交额${(stock.amount/100000000).toFixed(1)}亿`,
      summary: `${stock.name}今日强势上涨，涨幅达${stock.changePercent.toFixed(2)}%，现报${stock.price.toFixed(2)}元。`,
      source: 'QuantViz实时',
      category: '个股动态',
      stocks: [stock.code]
    });
  }
  
  return news;
}

// ========== 生成推荐 ==========
async function generateRecommendations() {
  const stocks = await fetchStocks();
  const recommendations = [];
  
  // 按涨幅排序，选择前6只
  const topStocks = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 6);
  
  for (const stock of topStocks) {
    const rating = stock.changePercent > 5 ? '强烈推荐' : stock.changePercent > 2 ? '推荐买入' : '谨慎推荐';
    const color = stock.changePercent > 5 ? '#00e676' : stock.changePercent > 2 ? '#00d4ff' : '#fdcb6e';
    const targetPrice = stock.price * 1.15;
    
    recommendations.push({
      code: stock.code,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      sector: stock.sector,
      rating,
      ratingColor: color,
      targetPrice: parseFloat(targetPrice.toFixed(2)),
      currentPrice: stock.price,
      reason: `今日表现强势，涨幅${stock.changePercent.toFixed(2)}%，成交活跃。${stock.sector}板块受关注度高。`,
      strategy: `建议逢低布局，目标价${targetPrice.toFixed(2)}元，止损价${(stock.price * 0.92).toFixed(2)}元。`,
      highlights: ['涨幅居前', '成交放量', '板块热点'],
      risk: '短期涨幅较大，注意回调风险'
    });
  }
  
  return recommendations;
}

// ========== 生成排行榜 ==========
async function generateRanking() {
  const stocks = await fetchStocks();
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  
  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.reverse().slice(0, 10)
  };
}

// ========== 辅助函数 ==========
function formatIndexCode(code) {
  const map = {
    'sh000001': '000001.SH',
    'sz399001': '399001.SZ',
    'sz399006': '399006.SZ',
    'sh000688': '000688.SH'
  };
  return map[code] || code;
}

function getSector(name) {
  if (name.includes('茅台') || name.includes('五粮液') || name.includes('汾酒') || name.includes('洋河')) return '白酒';
  if (name.includes('华创') || name.includes('中芯') || name.includes('半导体')) return '半导体';
  if (name.includes('宁德') || name.includes('锂业') || name.includes('锂电')) return '锂电池';
  if (name.includes('比亚迪') || name.includes('长安汽车')) return '汽车';
  if (name.includes('隆基') || name.includes('光伏')) return '光伏';
  if (name.includes('银行') || name.includes('工商') || name.includes('农业') || name.includes('建设')) return '银行';
  if (name.includes('人寿') || name.includes('太保') || name.includes('保险')) return '保险';
  if (name.includes('药') || name.includes('医')) return '医药';
  if (name.includes('立讯') || name.includes('电子')) return '消费电子';
  if (name.includes('财富') || name.includes('证券')) return '互联网金融';
  return '其他';
}

function getTags(code, name) {
  const tags = [];
  if (code.startsWith('sh')) tags.push('沪市主板');
  else if (code.startsWith('sz000') || code.startsWith('sz002')) tags.push('深市主板');
  else if (code.startsWith('sz300')) tags.push('创业板');
  else if (code.startsWith('sh688')) tags.push('科创板');
  
  if (name.includes('茅台') || name.includes('宁德') || name.includes('比亚迪')) tags.push('龙头股');
  tags.push(getSector(name));
  
  return tags;
}

module.exports = {
  fetchIndices,
  fetchStocks,
  fetchSectors,
  generateNews,
  generateRecommendations,
  generateRanking
};
