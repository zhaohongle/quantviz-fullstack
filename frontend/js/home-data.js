// ========== 全球指数首页数据加载脚本 ==========

// API 配置
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'http://localhost:3001'; // 生产环境根据实际情况修改

// ========== 加载全球指数数据 ==========
async function loadIndices() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home/data`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.indices || data.indices.length === 0) {
      showError('indices-grid', '暂无指数数据');
      return;
    }
    
    renderIndices(data.indices);
    updateUpdateTime(data.updateTime || data.lastUpdate);
    
  } catch (error) {
    console.error('加载指数数据失败:', error);
    showError('indices-grid', '加载指数数据失败，请稍后重试');
  }
}

// ========== 渲染指数卡片 ==========
function renderIndices(indices) {
  const grid = document.getElementById('indices-grid');
  
  grid.innerHTML = indices.map(index => {
    const isUp = index.changePercent >= 0;
    const arrow = isUp ? '▲' : '▼';
    const changeClass = isUp ? 'up' : 'down';
    
    return `
      <div class="index-card" onclick="goToDetail('${index.code}')">
        <div class="index-market">${index.market}</div>
        <div class="index-name">${index.name}</div>
        <div class="index-value">${formatNumber(index.price || index.value)}</div>
        <div class="index-change ${changeClass}">
          ${arrow} ${formatPercent(index.changePercent)}
        </div>
        <div class="index-details">
          <div class="index-detail-item">
            <span class="index-detail-label">今开</span>
            <span class="index-detail-value">${formatNumber(index.open)}</span>
          </div>
          <div class="index-detail-item">
            <span class="index-detail-label">最高</span>
            <span class="index-detail-value">${formatNumber(index.high)}</span>
          </div>
          <div class="index-detail-item">
            <span class="index-detail-label">昨收</span>
            <span class="index-detail-value">${formatNumber(index.preClose)}</span>
          </div>
          <div class="index-detail-item">
            <span class="index-detail-label">最低</span>
            <span class="index-detail-value">${formatNumber(index.low)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== 加载股市资讯 ==========
async function loadNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home/data`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.news || data.news.length === 0) {
      showError('news-list', '暂无资讯');
      return;
    }
    
    renderNews(data.news);
    
  } catch (error) {
    console.error('加载资讯失败:', error);
    showError('news-list', '加载资讯失败，请稍后重试');
  }
}

// ========== 渲染资讯列表 ==========
function renderNews(news) {
  const list = document.getElementById('news-list');
  
  list.innerHTML = news.map(item => {
    const time = formatTime(item.datetime || item.time);
    
    return `
      <div class="news-card" onclick="goToNewsDetail('${item.id}')">
        <div class="news-time">${time}</div>
        <div class="news-title">${escapeHtml(item.headline || item.title)}</div>
        <div class="news-summary">${escapeHtml(item.summary || '')}</div>
      </div>
    `;
  }).join('');
}

// ========== 工具函数 ==========

// 格式化数字（保留2位小数）
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '--';
  }
  return Number(num).toFixed(2);
}

// 格式化百分比
function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '--';
  }
  const abs = Math.abs(num);
  return `${abs.toFixed(2)}%`;
}

// 格式化时间
function formatTime(datetime) {
  if (!datetime) {
    return '--:--';
  }
  
  try {
    // 如果是 ISO 格式字符串
    if (typeof datetime === 'string' && datetime.includes('T')) {
      const date = new Date(datetime);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // 如果已经是时间格式字符串
    if (typeof datetime === 'string' && datetime.includes(':')) {
      return datetime;
    }
    
    return '--:--';
  } catch (error) {
    console.error('格式化时间失败:', error);
    return '--:--';
  }
}

// HTML 转义（防止 XSS）
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// 显示错误信息
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerHTML = `
    <div class="error">
      <p>⚠️ ${message}</p>
    </div>
  `;
}

// 更新最后更新时间
function updateUpdateTime(updateTime) {
  const element = document.getElementById('update-time');
  if (element) {
    const timeStr = typeof updateTime === 'number' 
      ? new Date(updateTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      : updateTime;
    element.textContent = `最后更新: ${timeStr}`;
  }
}

// ========== 页面跳转 ==========

// 跳转到指数详情页
function goToDetail(code) {
  // 根据实际路由设计调整
  window.location.href = `../prd1/indices.html?code=${code}`;
}

// 跳转到资讯详情页
function goToNewsDetail(id) {
  // 根据实际路由设计调整
  window.location.href = `../prd1/news-detail.html?id=${id}`;
}

// ========== 自动刷新 ==========
let refreshInterval = null;

function startAutoRefresh() {
  // 每 30 秒自动刷新
  refreshInterval = setInterval(() => {
    console.log('🔄 自动刷新数据...');
    loadIndices();
    loadNews();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('📊 全球指数首页初始化...');
  
  // 加载数据
  loadIndices();
  loadNews();
  
  // 启动自动刷新
  startAutoRefresh();
  
  // 页面卸载时停止刷新
  window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
  });
});

// ========== 错误处理 ==========
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
});
