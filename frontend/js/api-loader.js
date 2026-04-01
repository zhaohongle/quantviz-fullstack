// ========== API数据加载器 ==========
// 从后端API加载实时数据,替代mock数据

// API配置
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://quantviz-fullstack.onrender.com/api';  // Render后端API

// ========== 数据生成工具函数 ==========
// 生成K线数据
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

// 生成走势图数据
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

// 全局状态
window.API_STATUS = {
  connected: false,
  lastUpdate: null,
  loading: false,
  error: null
};

// ========== 加载所有数据 ==========
async function loadAllData() {
  try {
    window.API_STATUS.loading = true;
    updateStatusIndicator('loading');
    
    const response = await fetch(`${API_BASE}/data`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // 为股票生成K线数据和走势数据（API返回的数据不包含这些）
    if (data.stocks && Array.isArray(data.stocks)) {
      data.stocks.forEach(stock => {
        // 生成K线数据（使用价格作为基准）
        stock.klineData = generateKLineData(stock.prevClose || stock.price, 120, 0.02);
        // 生成走势数据
        stock.sparkline = generateSparkline();
      });
    }
    
    // 为指数生成走势数据
    if (data.indices && Array.isArray(data.indices)) {
      data.indices.forEach(index => {
        index.sparkline = generateSparkline();
      });
    }
    
    // 更新全局数据
    window.MOCK_INDICES = data.indices || [];
    window.MOCK_STOCKS = data.stocks || [];
    window.MOCK_SECTORS = data.sectors || [];
    window.MOCK_NEWS = data.news || [];
    window.MOCK_RECOMMENDATIONS = data.recommendations || [];
    window.MOCK_RANKING = data.ranking || { gainers: [], losers: [] };
    
    // 更新状态
    window.API_STATUS.connected = true;
    window.API_STATUS.lastUpdate = data.lastUpdate;
    window.API_STATUS.loading = false;
    window.API_STATUS.error = null;
    
    updateStatusIndicator('connected', data.updateTime);
    
    console.log('✅ API数据加载成功');
    console.log('  指数:', window.MOCK_INDICES.length);
    console.log('  股票:', window.MOCK_STOCKS.length);
    console.log('  新闻:', window.MOCK_NEWS.length);
    console.log('  更新时间:', data.updateTime);
    
    return true;
  } catch (error) {
    console.error('❌ API数据加载失败:', error.message);
    window.API_STATUS.loading = false;
    window.API_STATUS.error = error.message;
    updateStatusIndicator('error', error.message);
    
    // 降级到mock数据
    console.warn('⚠️ 降级使用本地mock数据');
    return false;
  }
}

// ========== 更新状态指示器 ==========
function updateStatusIndicator(status, message) {
  let statusEl = document.getElementById('api-status');
  
  if (!statusEl) {
    // 创建状态指示器
    statusEl = document.createElement('div');
    statusEl.id = 'api-status';
    statusEl.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      color: var(--text-sec);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(statusEl);
  }
  
  const statusConfig = {
    loading: { icon: '🔄', text: '数据加载中...', color: '#00d4ff' },
    connected: { icon: '🟢', text: `实时数据 · ${message}`, color: '#00e676' },
    error: { icon: '🔴', text: `离线 · ${message}`, color: '#ff5252' }
  };
  
  const config = statusConfig[status];
  statusEl.innerHTML = `
    <span style="font-size:14px">${config.icon}</span>
    <span style="color:${config.color}">${config.text}</span>
  `;
}

// ========== 自动刷新 ==========
function startAutoRefresh(intervalMs = 30000) {
  setInterval(async () => {
    console.log('🔄 自动刷新数据...');
    const success = await loadAllData();
    if (success && typeof handleRoute === 'function') {
      // 重新渲染当前页面
      handleRoute();
    }
  }, intervalMs);
  
  console.log(`⏰ 自动刷新已启动（每${intervalMs/1000}秒）`);
}

// ========== 页面加载时执行 ==========
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 初始化API数据加载器...');
  
  // 首次加载
  await loadAllData();
  
  // 启动自动刷新（30秒）
  startAutoRefresh(30000);
});

// 暴露全局方法
window.loadAllData = loadAllData;
