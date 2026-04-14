// ========== 自选股管理系统 ==========

// 全局状态
const WatchlistState = {
  watchlist: JSON.parse(localStorage.getItem('watchlist_v2') || '[]'),
  priceAlerts: JSON.parse(localStorage.getItem('price_alerts') || '{}'),
  stockData: {},
  refreshInterval: null
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadNavigation();
  await loadWatchlist();
  startPriceMonitoring();
  
  // 每30秒刷新一次价格
  WatchlistState.refreshInterval = setInterval(loadWatchlist, 30000);
});

// 加载导航栏
async function loadNavigation() {
  const navDiv = document.getElementById('navigation');
  if (!navDiv) return;
  
  const response = await fetch('../../components/navigation.html');
  const html = await response.text();
  navDiv.innerHTML = html;
}

// 加载自选股列表
async function loadWatchlist() {
  const container = document.getElementById('watchlistContent');
  
  if (WatchlistState.watchlist.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📊</div>
        <h3>还没有添加自选股</h3>
        <p style="color: #888; margin-top: 0.5rem;">点击右上角"添加自选股"按钮开始</p>
      </div>
    `;
    return;
  }

  // 显示加载状态
  container.innerHTML = '<div class="loading" style="grid-column: 1 / -1;">加载中...</div>';

  try {
    // 批量获取股票数据
    const promises = WatchlistState.watchlist.map(async (item) => {
      try {
        const data = await window.API_Integration.fetchStockQuote(item.code);
        WatchlistState.stockData[item.code] = data;
        return { code: item.code, data };
      } catch (error) {
        console.error(`获取 ${item.code} 数据失败:`, error);
        return { code: item.code, data: null };
      }
    });

    await Promise.all(promises);

    // 渲染股票卡片
    renderStockCards();
  } catch (error) {
    console.error('加载自选股失败:', error);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚠️</div>
        <h3>加载失败</h3>
        <p style="color: #888; margin-top: 0.5rem;">${error.message}</p>
        <button class="add-stock-btn" onclick="loadWatchlist()" style="margin-top: 1rem;">重试</button>
      </div>
    `;
  }
}

// 渲染股票卡片
function renderStockCards() {
  const container = document.getElementById('watchlistContent');
  
  const html = WatchlistState.watchlist.map(item => {
    const data = WatchlistState.stockData[item.code];
    if (!data) return '';

    const change = data.change || 0;
    const changePercent = data.changePercent || 0;
    const isPositive = change >= 0;
    const alertInfo = WatchlistState.priceAlerts[item.code];

    return `
      <div class="stock-card" onclick="goToDetail('${item.code}')">
        <div class="stock-card-header">
          <div class="stock-info">
            <h3>${data.name || item.code}</h3>
            <div class="stock-code">${item.code}</div>
          </div>
          <button class="remove-btn" onclick="event.stopPropagation(); removeStock('${item.code}')">
            🗑️
          </button>
        </div>

        <div class="stock-price">¥${data.price?.toFixed(2) || '--'}</div>
        <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '↗' : '↘'} ${change.toFixed(2)} (${changePercent.toFixed(2)}%)
        </div>

        <div class="stock-alert" onclick="event.stopPropagation();">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>🔔 价格预警</span>
            ${alertInfo ? `<span style="color: #ffcc00;">已设置</span>` : ''}
          </div>
          <div class="alert-controls">
            <input 
              type="number" 
              class="alert-input" 
              placeholder="目标价格"
              value="${alertInfo?.target || ''}"
              id="alert-${item.code}"
              step="0.01"
            >
            <button class="alert-btn" onclick="setPriceAlert('${item.code}')">
              ${alertInfo ? '更新' : '设置'}
            </button>
            ${alertInfo ? `
              <button class="alert-btn" onclick="removePriceAlert('${item.code}')" style="background: rgba(255, 59, 48, 0.2); border-color: rgba(255, 59, 48, 0.4); color: #ff3b30;">
                删除
              </button>
            ` : ''}
          </div>
          ${alertInfo ? `
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #888;">
              当前: ¥${data.price?.toFixed(2)} | 目标: ¥${alertInfo.target}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// 打开添加股票弹窗
function openAddStockModal() {
  const modal = document.getElementById('addStockModal');
  modal.classList.add('active');
  document.getElementById('stockSearchInput').focus();
}

// 关闭添加股票弹窗
function closeAddStockModal() {
  const modal = document.getElementById('addStockModal');
  modal.classList.remove('active');
  document.getElementById('stockSearchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

// 搜索股票
let searchTimeout = null;
async function searchStocks(query) {
  const resultsDiv = document.getElementById('searchResults');
  
  if (!query || query.length < 2) {
    resultsDiv.innerHTML = '<div class="loading">请输入至少2个字符...</div>';
    return;
  }

  // 防抖
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    resultsDiv.innerHTML = '<div class="loading">搜索中...</div>';

    try {
      // 使用筛选接口搜索
      const response = await window.API_Integration.fetchFilteredStocks({
        keyword: query,
        limit: 20
      });

      if (!response || response.length === 0) {
        resultsDiv.innerHTML = '<div class="loading">未找到相关股票</div>';
        return;
      }

      const html = response.map(stock => {
        const isAdded = WatchlistState.watchlist.some(item => item.code === stock.code);
        return `
          <div class="search-item" onclick="addStock('${stock.code}', '${stock.name}')">
            <div class="search-item-header">
              <div>
                <h4>${stock.name}</h4>
                <div class="stock-code">${stock.code}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.2rem; font-weight: 600;">¥${stock.price?.toFixed(2) || '--'}</div>
                <div style="font-size: 0.9rem; color: ${stock.change >= 0 ? '#34c759' : '#ff3b30'};">
                  ${stock.change >= 0 ? '↗' : '↘'} ${stock.changePercent?.toFixed(2) || 0}%
                </div>
              </div>
            </div>
            ${isAdded ? '<div style="margin-top: 0.5rem; color: #ffcc00; font-size: 0.85rem;">✓ 已添加</div>' : ''}
          </div>
        `;
      }).join('');

      resultsDiv.innerHTML = html;
    } catch (error) {
      console.error('搜索失败:', error);
      resultsDiv.innerHTML = `<div class="loading" style="color: #ff3b30;">搜索失败: ${error.message}</div>`;
    }
  }, 300);
}

// 添加股票到自选
function addStock(code, name) {
  // 检查是否已存在
  if (WatchlistState.watchlist.some(item => item.code === code)) {
    showNotification(`${name} 已在自选股中`, 'info');
    return;
  }

  // 添加到列表
  WatchlistState.watchlist.push({
    code,
    name,
    addedAt: new Date().toISOString()
  });

  // 保存到 localStorage
  saveWatchlist();

  // 显示通知
  showNotification(`✓ 已添加 ${name}`, 'success');

  // 关闭弹窗
  closeAddStockModal();

  // 重新加载列表
  loadWatchlist();
}

// 删除股票
function removeStock(code) {
  const stock = WatchlistState.watchlist.find(item => item.code === code);
  if (!stock) return;

  if (!confirm(`确定要删除 ${stock.name || code} 吗？`)) {
    return;
  }

  // 从列表中移除
  WatchlistState.watchlist = WatchlistState.watchlist.filter(item => item.code !== code);

  // 删除价格预警
  delete WatchlistState.priceAlerts[code];
  localStorage.setItem('price_alerts', JSON.stringify(WatchlistState.priceAlerts));

  // 保存到 localStorage
  saveWatchlist();

  // 显示通知
  showNotification(`✓ 已删除 ${stock.name || code}`, 'success');

  // 重新加载列表
  loadWatchlist();
}

// 设置价格预警
function setPriceAlert(code) {
  const input = document.getElementById(`alert-${code}`);
  const targetPrice = parseFloat(input.value);

  if (!targetPrice || targetPrice <= 0) {
    showNotification('请输入有效的目标价格', 'error');
    return;
  }

  const stock = WatchlistState.watchlist.find(item => item.code === code);
  const currentPrice = WatchlistState.stockData[code]?.price || 0;

  WatchlistState.priceAlerts[code] = {
    target: targetPrice,
    currentPrice,
    setAt: new Date().toISOString(),
    triggered: false
  };

  localStorage.setItem('price_alerts', JSON.stringify(WatchlistState.priceAlerts));

  showNotification(`✓ 已为 ${stock?.name || code} 设置价格预警`, 'success');
  
  // 重新渲染以显示更新
  renderStockCards();
}

// 删除价格预警
function removePriceAlert(code) {
  delete WatchlistState.priceAlerts[code];
  localStorage.setItem('price_alerts', JSON.stringify(WatchlistState.priceAlerts));
  
  const stock = WatchlistState.watchlist.find(item => item.code === code);
  showNotification(`✓ 已删除 ${stock?.name || code} 的价格预警`, 'success');
  
  renderStockCards();
}

// 价格监控（检查预警）
function startPriceMonitoring() {
  setInterval(() => {
    Object.keys(WatchlistState.priceAlerts).forEach(code => {
      const alert = WatchlistState.priceAlerts[code];
      const currentPrice = WatchlistState.stockData[code]?.price;

      if (!currentPrice || alert.triggered) return;

      const stock = WatchlistState.watchlist.find(item => item.code === code);
      const stockName = stock?.name || code;

      // 检查是否触发预警
      if (currentPrice >= alert.target && alert.currentPrice < alert.target) {
        // 价格上涨到目标价
        alert.triggered = true;
        localStorage.setItem('price_alerts', JSON.stringify(WatchlistState.priceAlerts));
        
        showNotification(
          `🔔 ${stockName} 已达到目标价格！\n当前: ¥${currentPrice.toFixed(2)} | 目标: ¥${alert.target}`,
          'alert'
        );

        // 浏览器通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('QuantViz 价格预警', {
            body: `${stockName} 已达到目标价格 ¥${alert.target}`,
            icon: '/favicon.ico'
          });
        }
      } else if (currentPrice <= alert.target && alert.currentPrice > alert.target) {
        // 价格下跌到目标价
        alert.triggered = true;
        localStorage.setItem('price_alerts', JSON.stringify(WatchlistState.priceAlerts));
        
        showNotification(
          `🔔 ${stockName} 已跌至目标价格！\n当前: ¥${currentPrice.toFixed(2)} | 目标: ¥${alert.target}`,
          'alert'
        );

        // 浏览器通知
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('QuantViz 价格预警', {
            body: `${stockName} 已跌至目标价格 ¥${alert.target}`,
            icon: '/favicon.ico'
          });
        }
      }

      // 更新当前价格
      alert.currentPrice = currentPrice;
    });
  }, 5000); // 每5秒检查一次
}

// 请求浏览器通知权限
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// 保存自选股列表
function saveWatchlist() {
  localStorage.setItem('watchlist_v2', JSON.stringify(WatchlistState.watchlist));
}

// 跳转到股票详情
function goToDetail(code) {
  window.location.href = `../stocks/detail.html?code=${code}`;
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.getElementById('alertNotification');
  
  const colors = {
    success: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
    error: 'linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)',
    alert: 'linear-gradient(135deg, #ffcc00 0%, #ff9500 100%)',
    info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  notification.style.background = colors[type] || colors.info;
  notification.style.whiteSpace = 'pre-line';
  notification.textContent = message;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // ESC 关闭弹窗
  if (e.key === 'Escape') {
    closeAddStockModal();
  }
  
  // Ctrl/Cmd + K 打开添加股票弹窗
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openAddStockModal();
  }
});

// 点击弹窗外部关闭
document.getElementById('addStockModal').addEventListener('click', (e) => {
  if (e.target.id === 'addStockModal') {
    closeAddStockModal();
  }
});

// 清理定时器
window.addEventListener('beforeunload', () => {
  if (WatchlistState.refreshInterval) {
    clearInterval(WatchlistState.refreshInterval);
  }
});
