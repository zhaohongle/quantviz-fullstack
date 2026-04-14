// ========== API 客户端 ==========
// 封装真实金融数据 API 调用（新浪财经 + 东方财富）

const axios = require('axios');
const iconv = require('iconv-lite');

// ========== 配置 ==========
const SINA_BASE_URL = 'https://hq.sinajs.cn/list=';
const EASTMONEY_SECTOR_URL = 'http://push2.eastmoney.com/api/qt/clist/get';
const SINA_NEWS_URL = 'https://finance.sina.com.cn/roll/index.d.html';

// 请求配置
const REQUEST_CONFIG = {
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://finance.sina.com.cn/'
  }
};

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// ========== 通用重试函数 ==========
async function retryRequest(requestFn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.error(`请求失败 (尝试 ${i + 1}/${retries}):`, error.message);
      
      if (i === retries - 1) {
        throw error; // 最后一次重试失败，抛出错误
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
}

// ========== 股票实时行情（新浪财经）==========
/**
 * 获取股票实时行情
 * @param {string|string[]} codes - 股票代码（如 'sh600519' 或 ['sh600519', 'sz000001']）
 * @returns {Promise<Array>} 股票数据数组
 */
async function fetchStockQuotes(codes) {
  const codeList = Array.isArray(codes) ? codes : [codes];
  const codeStr = codeList.join(',');
  
  return retryRequest(async () => {
    const response = await axios.get(`${SINA_BASE_URL}${codeStr}`, {
      ...REQUEST_CONFIG,
      responseType: 'arraybuffer' // 处理 GBK 编码
    });
    
    const data = iconv.decode(response.data, 'gbk');
    return parseSinaStockData(data);
  });
}

/**
 * 解析新浪财经股票数据
 * 格式：var hq_str_sh600519="贵州茅台,2659.00,2680.00,2658.98,..."
 */
function parseSinaStockData(rawData) {
  const stocks = [];
  const lines = rawData.trim().split('\n');
  
  for (const line of lines) {
    const match = line.match(/var hq_str_(\w+)="(.+?)";/);
    if (!match) continue;
    
    const fullCode = match[1]; // 如 sh600519
    const fields = match[2].split(',');
    
    // 字段说明（新浪财经格式）：
    // 0: 股票名称
    // 1: 今日开盘价
    // 2: 昨日收盘价
    // 3: 当前价格
    // 4: 最高价
    // 5: 最低价
    // 6: 买一价
    // 7: 卖一价
    // 8: 成交股数（股）
    // 9: 成交金额（元）
    // 10-29: 买卖五档
    // 30: 日期
    // 31: 时间
    
    if (fields.length < 32) continue; // 数据不完整
    
    const name = fields[0];
    const currentPrice = parseFloat(fields[3]);
    const prevClose = parseFloat(fields[2]);
    const change = currentPrice - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    const stock = {
      code: fullCode.substring(2), // 去掉 sh/sz 前缀
      name,
      market: fullCode.startsWith('sh') ? 'SH' : 'SZ',
      price: currentPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      open: parseFloat(fields[1]),
      high: parseFloat(fields[4]),
      low: parseFloat(fields[5]),
      prevClose,
      volume: parseInt(fields[8]), // 成交量（股）
      amount: parseFloat((parseFloat(fields[9]) / 100000000).toFixed(2)), // 成交额（亿元）
      bid1: parseFloat(fields[6]), // 买一价
      ask1: parseFloat(fields[7]), // 卖一价
      time: `${fields[30]} ${fields[31]}` // 更新时间
    };
    
    stocks.push(stock);
  }
  
  return stocks;
}

// ========== 指数实时行情 ==========
/**
 * 获取指数实时行情
 * @returns {Promise<Array>} 指数数据数组
 */
async function fetchIndices() {
  const codes = [
    'sh000001', // 上证指数
    'sz399001', // 深证成指
    'sz399006', // 创业板指
    'sh000688'  // 科创50
  ];
  
  return retryRequest(async () => {
    const response = await axios.get(`${SINA_BASE_URL}${codes.join(',')}`, {
      ...REQUEST_CONFIG,
      responseType: 'arraybuffer'
    });
    
    const data = iconv.decode(response.data, 'gbk');
    return parseSinaIndexData(data);
  });
}

/**
 * 解析新浪财经指数数据
 */
function parseSinaIndexData(rawData) {
  const indices = [];
  const lines = rawData.trim().split('\n');
  
  const indexNames = {
    'sh000001': '上证指数',
    'sz399001': '深证成指',
    'sz399006': '创业板指',
    'sh000688': '科创50'
  };
  
  for (const line of lines) {
    const match = line.match(/var hq_str_(\w+)="(.+?)";/);
    if (!match) continue;
    
    const code = match[1];
    const fields = match[2].split(',');
    
    const currentValue = parseFloat(fields[3]);
    const prevClose = parseFloat(fields[2]);
    const change = currentValue - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    const index = {
      code: formatIndexCode(code),
      name: indexNames[code] || fields[0],
      value: currentValue,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      open: parseFloat(fields[1]),
      high: parseFloat(fields[4]),
      low: parseFloat(fields[5]),
      prevClose,
      volume: parseInt(fields[8]),
      amount: parseFloat((parseFloat(fields[9]) / 100000000).toFixed(0)) // 成交额（亿元）
    };
    
    indices.push(index);
  }
  
  return indices;
}

// ========== 板块资金流（东方财富）==========
/**
 * 获取板块资金流数据
 * @returns {Promise<Array>} 板块数据数组
 */
async function fetchSectorFundFlow() {
  return retryRequest(async () => {
    const params = {
      pn: 1,
      pz: 50,
      po: 1,
      np: 1,
      ut: 'bd1d9ddb04089700cf9c27f6f7426281',
      fltt: 2,
      invt: 2,
      fid: 'f3', // 按涨跌幅排序
      fs: 'm:90+t:2', // 板块
      fields: 'f1,f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18'
    };
    
    const response = await axios.get(EASTMONEY_SECTOR_URL, {
      params,
      timeout: 10000,
      headers: {
        'Referer': 'http://quote.eastmoney.com/'
      }
    });
    
    return parseEastMoneySectorData(response.data);
  });
}

/**
 * 解析东方财富板块数据
 */
function parseEastMoneySectorData(data) {
  if (!data || !data.data || !data.data.diff) {
    return [];
  }
  
  const sectors = [];
  
  for (const item of data.data.diff) {
    const sector = {
      name: item.f14, // 板块名称
      changePercent: parseFloat((item.f3 / 100).toFixed(2)), // 涨跌幅
      flow: parseFloat((item.f6 / 100000000).toFixed(2)), // 资金流入（亿元）
      leadingStock: item.f14, // 领涨股（简化处理）
      color: item.f3 > 0 ? '#00e676' : '#ff5252'
    };
    
    sectors.push(sector);
  }
  
  return sectors.sort((a, b) => b.changePercent - a.changePercent);
}

// ========== K 线数据（可选，暂不实现）==========
/**
 * 获取 K 线数据（预留接口）
 * @param {string} code - 股票代码
 * @param {string} period - 周期（day/week/month）
 */
async function fetchKLineData(code, period = 'day') {
  // TODO: 实现 K 线数据获取
  // 新浪财经 K 线接口比较复杂，暂时不实现
  throw new Error('K 线数据接口暂未实现');
}

// ========== 财经新闻（模拟，暂不实现真实爬取）==========
/**
 * 获取财经新闻（预留接口）
 */
async function fetchFinanceNews() {
  // TODO: 实现新闻爬取
  // 真实新闻爬取需要处理反爬虫，暂时不实现
  return [];
}

// ========== 辅助函数 ==========
function formatIndexCode(code) {
  const market = code.startsWith('sh') ? 'SH' : 'SZ';
  const number = code.substring(2);
  return `${number}.${market}`;
}

// ========== 健康检查 ==========
/**
 * 测试 API 连接
 */
async function healthCheck() {
  try {
    console.log('🔍 测试新浪财经 API...');
    const stocks = await fetchStockQuotes('sh600519');
    console.log('✅ 新浪财经 API 正常:', stocks[0]?.name);
    
    console.log('🔍 测试东方财富 API...');
    const sectors = await fetchSectorFundFlow();
    console.log('✅ 东方财富 API 正常:', sectors.length, '个板块');
    
    return {
      sina: true,
      eastmoney: true,
      message: 'API 连接正常'
    };
  } catch (error) {
    console.error('❌ API 连接测试失败:', error.message);
    return {
      sina: false,
      eastmoney: false,
      message: error.message
    };
  }
}

// ========== 导出 ==========
module.exports = {
  fetchStockQuotes,
  fetchIndices,
  fetchSectorFundFlow,
  fetchKLineData,
  fetchFinanceNews,
  healthCheck
};
