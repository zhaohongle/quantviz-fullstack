// ========================================
// QuantViz V2 数据采集脚本
// 数据源: 新浪财经 + 东方财富
// ========================================

const axios = require('axios');
const iconv = require('iconv-lite');

// 配置
const CONFIG = {
  // 新浪财经API
  SINA_QUOTE_URL: 'https://hq.sinajs.cn/list=',
  SINA_KLINE_URL: 'https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData',
  SINA_NEWS_URL: 'https://feed.mix.sina.com.cn/api/roll/get',
  
  // 东方财富API
  EASTMONEY_SECTOR_URL: 'https://push2.eastmoney.com/api/qt/clist/get',
  
  // 请求超时
  TIMEOUT: 10000,
  
  // 重试次数
  MAX_RETRIES: 3
};

// ========================================
// 工具函数
// ========================================

/**
 * HTTP请求（支持自动重试）
 */
async function fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRIES) {
  try {
    const response = await axios({
      url,
      method: options.method || 'GET',
      timeout: CONFIG.TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://finance.sina.com.cn/',
        ...options.headers
      },
      responseType: options.responseType || 'text',
      ...options
    });
    
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`⚠️  请求失败，剩余重试次数: ${retries}, URL: ${url}`);
      await sleep(1000);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 解析新浪财经行情数据
 */
function parseSinaQuote(symbol, rawData) {
  const parts = rawData.split(',');
  if (parts.length < 8) return null;
  
  return {
    symbol: symbol,
    name: parts[0],
    currentPrice: parseFloat(parts[1]) || 0,
    changeAmount: parseFloat(parts[2]) || 0,
    changePercent: parseFloat(parts[3]) || 0,
    volume: parseInt(parts[4]) || 0,
    amount: parseFloat(parts[5]) || 0,
    openPrice: parseFloat(parts[6]) || 0,
    closePrice: parseFloat(parts[7]) || 0,
    highPrice: parseFloat(parts[8]) || 0,
    lowPrice: parseFloat(parts[9]) || 0,
    quoteTime: new Date()
  };
}

// ========================================
// 数据采集模块
// ========================================

/**
 * 1. 采集指数实时行情
 */
async function fetchIndexQuotes(symbols) {
  console.log('📊 开始采集指数行情...');
  
  try {
    const quotes = [];
    
    // 逐个获取（避免批量请求解析问题）
    for (const symbol of symbols) {
      const url = `${CONFIG.SINA_QUOTE_URL}s_${symbol}`;
      const rawData = await fetchWithRetry(url);
      
      // 解析数据：var hq_str_s_sh000001="上证指数,3200.00,10.00,0.31,...";
      const match = rawData.match(/var hq_str_s_.+?="(.+?)";/);
      
      if (match && match[1]) {
        const data = match[1];
        const parts = data.split(',');
        
        if (parts.length >= 4) {
          quotes.push({
            symbol: symbol,
            name: parts[0],
            currentPrice: parseFloat(parts[1]) || 0,
            changeAmount: parseFloat(parts[2]) || 0,
            changePercent: parseFloat(parts[3]) || 0,
            quoteTime: new Date()
          });
        }
      }
      
      await sleep(100); // 避免请求过快
    }
    
    console.log(`✅ 指数行情采集完成: ${quotes.length}个`);
    return quotes;
    
  } catch (error) {
    console.error('❌ 指数行情采集失败:', error.message);
    return [];
  }
}

/**
 * 2. 采集指数K线数据
 */
async function fetchIndexKline(symbol, scale = 240, datalen = 1023) {
  console.log(`📈 开始采集K线数据: ${symbol}`);
  
  try {
    const url = `${CONFIG.SINA_KLINE_URL}?symbol=${symbol}&scale=${scale}&datalen=${datalen}`;
    const rawData = await fetchWithRetry(url);
    
    // 新浪返回的是JSON数组字符串，需要解析
    const klineData = JSON.parse(rawData);
    
    if (!Array.isArray(klineData)) {
      throw new Error('K线数据格式错误');
    }
    
    const klines = klineData.map(item => ({
      symbol: symbol,
      period: scale === 5 ? '5m' : scale === 15 ? '15m' : scale === 30 ? '30m' : 
              scale === 60 ? '1h' : scale === 240 ? '1d' : '1w',
      klineTime: new Date(item.day),
      openPrice: parseFloat(item.open),
      highPrice: parseFloat(item.high),
      lowPrice: parseFloat(item.low),
      closePrice: parseFloat(item.close),
      volume: parseInt(item.volume) || 0
    }));
    
    console.log(`✅ K线数据采集完成: ${klines.length}条`);
    return klines;
    
  } catch (error) {
    console.error(`❌ K线数据采集失败 [${symbol}]:`, error.message);
    return [];
  }
}

/**
 * 3. 采集实时资讯
 */
async function fetchNews(page = 1, num = 50) {
  console.log('📰 开始采集资讯数据...');
  
  try {
    const url = `${CONFIG.SINA_NEWS_URL}?pageid=153&lid=2509&num=${num}&page=${page}`;
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // 解析JSON
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    if (!data.result || !data.result.data) {
      throw new Error('资讯数据格式错误');
    }
    
    const newsList = data.result.data.map(item => ({
      title: item.title,
      summary: item.intro || '',
      sourceUrl: item.url,
      source: item.media_name || '新浪财经',
      author: item.author || '',
      publishTime: new Date(item.ctime * 1000),
      category: item.channel && item.channel.title || '股市',
      tags: item.keywords ? item.keywords.split(',') : [],
      relatedSymbols: extractStockCodes(item.title + ' ' + (item.intro || '')),
      isImportant: item.is_top === 1
    }));
    
    console.log(`✅ 资讯数据采集完成: ${newsList.length}条`);
    return newsList;
    
  } catch (error) {
    console.error('❌ 资讯数据采集失败:', error.message);
    return [];
  }
}

/**
 * 4. 采集板块资金流向
 */
async function fetchSectorFlow(page = 1, pageSize = 50) {
  console.log('💰 开始采集板块资金流向...');
  
  try {
    // 东方财富板块资金流向接口
    const url = `${CONFIG.EASTMONEY_SECTOR_URL}?pn=${page}&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f62&fs=m:90+t:2&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124,f1,f13`;
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://data.eastmoney.com/'
      }
    });
    
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    if (!data.data || !data.data.diff) {
      throw new Error('板块资金流向数据格式错误');
    }
    
    const now = new Date();
    const flowData = data.data.diff.map(item => ({
      sectorCode: item.f12,
      sectorName: item.f14,
      flowDate: now.toISOString().split('T')[0],
      flowTime: now.toTimeString().split(' ')[0],
      currentPrice: item.f2 / 100,
      changePercent: item.f3 / 100,
      mainInflow: item.f62 / 10000,      // 主力净流入
      superInflow: item.f184 / 10000,    // 超大单净流入
      largeInflow: item.f66 / 10000,     // 大单净流入
      mediumInflow: item.f69 / 10000,    // 中单净流入
      smallInflow: item.f72 / 10000,     // 小单净流入
      totalAmount: item.f87 / 10000,     // 总成交额
      leadingStock: item.f124 || null    // 领涨股
    }));
    
    console.log(`✅ 板块资金流向采集完成: ${flowData.length}个板块`);
    return flowData;
    
  } catch (error) {
    console.error('❌ 板块资金流向采集失败:', error.message);
    return [];
  }
}

/**
 * 5. 采集个股资金流向
 */
async function fetchStockFlow(page = 1, pageSize = 100) {
  console.log('💸 开始采集个股资金流向...');
  
  try {
    // 东方财富个股资金流向接口（沪深A股）
    const url = `${CONFIG.EASTMONEY_SECTOR_URL}?pn=${page}&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f62&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://data.eastmoney.com/'
      }
    });
    
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    if (!data.data || !data.data.diff) {
      throw new Error('个股资金流向数据格式错误');
    }
    
    const now = new Date();
    const flowData = data.data.diff.map(item => ({
      stockCode: item.f12,
      stockName: item.f14,
      flowDate: now.toISOString().split('T')[0],
      flowTime: now.toTimeString().split(' ')[0],
      currentPrice: item.f2 / 100,
      changePercent: item.f3 / 100,
      mainInflow: item.f62 / 10000,
      superInflow: item.f184 / 10000,
      largeInflow: item.f66 / 10000,
      mediumInflow: item.f69 / 10000,
      smallInflow: item.f72 / 10000,
      totalAmount: item.f87 / 10000
    }));
    
    console.log(`✅ 个股资金流向采集完成: ${flowData.length}只股票`);
    return flowData;
    
  } catch (error) {
    console.error('❌ 个股资金流向采集失败:', error.message);
    return [];
  }
}

// ========================================
// 辅助函数
// ========================================

/**
 * 从文本中提取股票代码
 */
function extractStockCodes(text) {
  const codes = [];
  
  // 匹配 6位数字（沪深股票代码）
  const matches = text.match(/\b\d{6}\b/g);
  
  if (matches) {
    matches.forEach(code => {
      // 沪市: 600/601/603开头
      // 深市: 000/002/300开头
      if (/^(60|00|30)/.test(code)) {
        codes.push(code);
      }
    });
  }
  
  return [...new Set(codes)]; // 去重
}

/**
 * 格式化时间
 */
function formatDateTime(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// ========================================
// 测试函数
// ========================================

async function testFetch() {
  console.log('\n========================================');
  console.log('🧪 开始测试数据采集功能');
  console.log('========================================\n');
  
  try {
    // 测试1: 指数行情
    console.log('【测试 1/5】指数行情采集');
    const indexSymbols = ['sh000001', 'sz399001', 'sz399006'];
    const quotes = await fetchIndexQuotes(indexSymbols);
    console.log('样例数据:', JSON.stringify(quotes[0], null, 2));
    console.log('');
    
    await sleep(1000);
    
    // 测试2: K线数据
    console.log('【测试 2/5】K线数据采集');
    const klines = await fetchIndexKline('sh000001', 240, 30);
    console.log('样例数据:', JSON.stringify(klines[0], null, 2));
    console.log('');
    
    await sleep(1000);
    
    // 测试3: 资讯数据
    console.log('【测试 3/5】资讯数据采集');
    const news = await fetchNews(1, 10);
    console.log('样例数据:', JSON.stringify(news[0], null, 2));
    console.log('');
    
    await sleep(1000);
    
    // 测试4: 板块资金流向
    console.log('【测试 4/5】板块资金流向采集');
    const sectorFlow = await fetchSectorFlow(1, 10);
    console.log('样例数据:', JSON.stringify(sectorFlow[0], null, 2));
    console.log('');
    
    await sleep(1000);
    
    // 测试5: 个股资金流向
    console.log('【测试 5/5】个股资金流向采集');
    const stockFlow = await fetchStockFlow(1, 10);
    console.log('样例数据:', JSON.stringify(stockFlow[0], null, 2));
    console.log('');
    
    console.log('========================================');
    console.log('✅ 所有测试完成！');
    console.log('========================================\n');
    
    // 生成测试报告
    const report = {
      testTime: new Date().toISOString(),
      results: {
        indexQuotes: { success: quotes.length > 0, count: quotes.length },
        klineData: { success: klines.length > 0, count: klines.length },
        newsData: { success: news.length > 0, count: news.length },
        sectorFlow: { success: sectorFlow.length > 0, count: sectorFlow.length },
        stockFlow: { success: stockFlow.length > 0, count: stockFlow.length }
      },
      summary: {
        totalTests: 5,
        passedTests: [quotes, klines, news, sectorFlow, stockFlow].filter(d => d.length > 0).length,
        failedTests: 5 - [quotes, klines, news, sectorFlow, stockFlow].filter(d => d.length > 0).length
      }
    };
    
    return report;
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return { error: error.message };
  }
}

// ========================================
// 导出
// ========================================

module.exports = {
  fetchIndexQuotes,
  fetchIndexKline,
  fetchNews,
  fetchSectorFlow,
  fetchStockFlow,
  testFetch
};

// 如果直接运行此脚本，执行测试
if (require.main === module) {
  testFetch().then(report => {
    console.log('\n📋 测试报告:');
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.summary?.failedTests > 0 ? 1 : 0);
  });
}
