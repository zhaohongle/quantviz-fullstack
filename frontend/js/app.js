// ========== QuantViz Main Application ==========

// Global state
window.APP_STATE = {
  currentPage: 'dashboard',
  currentStock: null,
  currentIndex: '000001.SH',
  currentPeriod: 'daily',
  activeIndicators: ['ma', 'macd'],
  watchlist: JSON.parse(localStorage.getItem('watchlist') || 'null') || ['600519','002371','688981','300750','002594','600036','601318','601012','000858','601899','000651','000625'],
  theme: localStorage.getItem('theme') || 'dark',
  selectedNews: null,
  newsFilter: '全部',
  charts: {},
  sortField: 'changePercent',
  sortOrder: 'desc'
};

// Save watchlist
function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(window.APP_STATE.watchlist));
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  applyTheme(window.APP_STATE.theme);
  initRouter();
  setupGlobalListeners();
  handleRoute();
});

// ========== Theme ==========
function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  window.APP_STATE.theme = theme;
  localStorage.setItem('theme', theme);
  // Update theme icon
  const themeBtn = document.querySelector('.nav-btn[title*="主题"], .nav-btn[title*="暗色"]');
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const newTheme = window.APP_STATE.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  disposeAllCharts();
  handleRoute();
}

function disposeAllCharts() {
  Object.keys(window.APP_STATE.charts).forEach(key => {
    const chart = window.APP_STATE.charts[key];
    if (chart && chart.dispose) chart.dispose();
  });
  window.APP_STATE.charts = {};
}

// ========== Router ==========
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  const path = parts[0] || 'dashboard';

  disposeAllCharts();

  if (path === 'stock' && parts[1]) {
    renderStockDetail(parts[1]); // 现在是async，但可以直接调用
  } else if (path === 'sector' && parts[1]) {
    renderSectorDetail(decodeURIComponent(parts[1]));
  } else if (path === 'watchlist') {
    renderWatchlist();
  } else if (path === 'news') {
    renderNews();
  } else {
    renderDashboard();
  }
  updateNavActive(path);
  window.scrollTo(0, 0);
}

function navigate(path) { window.location.hash = '#/' + path; }
window.navigateToStock = async function(code) {
  // 如果数据还未加载，等待加载完成
  if (!window.MOCK_STOCKS || window.MOCK_STOCKS.length === 0) {
    if (typeof window.loadAllData === 'function') {
      await window.loadAllData();
    }
  }
  navigate('stock/' + code);
};

function updateNavActive(path) {
  document.querySelectorAll('.mobile-tabbar-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-path') === (path || 'dashboard'));
  });
}

// ========== Global event listeners (delegated) ==========
function setupGlobalListeners() {
  document.addEventListener('click', function(e) {
    // Theme toggle
    if (e.target.closest('.nav-btn[title*="主题"]') || e.target.closest('.nav-btn[title*="暗色"]')) {
      toggleTheme(); return;
    }
    // Watchlist nav
    if (e.target.closest('.nav-btn[title*="自选"]')) {
      navigate('watchlist'); return;
    }
  });

  // Search
  const searchInput = document.querySelector('.search-box input');
  const searchDropdown = document.querySelector('.search-dropdown');
  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', function() {
      const q = this.value.trim();
      if (q.length > 0) {
        searchDropdown.innerHTML = window.createSearchResults(q);
        searchDropdown.classList.add('active');
      } else {
        searchDropdown.classList.remove('active');
      }
    });
    searchInput.addEventListener('focus', function() {
      if (this.value.trim().length > 0) searchDropdown.classList.add('active');
    });
    searchInput.addEventListener('blur', function() {
      setTimeout(() => searchDropdown.classList.remove('active'), 250);
    });
  }

  // Window resize → resize echarts
  window.addEventListener('resize', function() {
    Object.values(window.APP_STATE.charts).forEach(c => { if (c && c.resize) c.resize(); });
    // mobile tabbar
    const tabbar = document.querySelector('.mobile-tabbar');
    if (tabbar) tabbar.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  });
}

// ========== Dashboard ==========
function renderDashboard() {
  window.APP_STATE.currentPage = 'dashboard';
  const c = document.getElementById('app-content');

  c.innerHTML = `
    <section class="index-row">
      ${window.MOCK_INDICES.map(idx => window.createIndexCard(idx)).join('')}
    </section>

    <section class="main-section">
      <div class="glass chart-container">
        <div class="chart-header">
          <div class="chart-title">
            <h2 id="chart-title">${window.MOCK_INDICES[0].name}</h2>
            <span class="tag">实时</span>
            <span class="tag" id="realtime-timestamp" style="background:var(--accent-alpha);color:var(--text-pri);font-size:11px;"></span>
          </div>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            <div class="tab-row" id="period-tabs">
              ${['日K','周K','月K','分时','5日','5min','15min','60min'].map((label, i) => {
                const periods = ['daily','weekly','monthly','minute','5day','5min','15min','60min'];
                return `<button class="tab-btn${periods[i] === window.APP_STATE.currentPeriod ? ' active' : ''}" data-period="${periods[i]}">${label}</button>`;
              }).join('')}
            </div>
            <div style="width:1px;height:20px;background:var(--border);"></div>
            <div class="chart-tools" id="indicator-btns">
              ${['MA','MACD','KDJ','RSI','BOLL'].map(ind => {
                const key = ind.toLowerCase();
                return `<button class="tool-btn${window.APP_STATE.activeIndicators.includes(key) ? ' active' : ''}" data-indicator="${key}">${ind}</button>`;
              }).join('')}
            </div>
            <button class="fullscreen-btn" id="fullscreen-btn" title="全屏">⛶</button>
          </div>
        </div>
        <div class="kline-area" id="kline-area">
          <div id="main-kline-chart" style="width:100%;height:100%;"></div>
        </div>
      </div>
    </section>

    <section class="sub-charts" id="sub-charts-section">
      <div class="glass sub-chart" id="market-sentiment-container">
        <div class="sub-chart-title"><span>📊 市场情绪</span><button class="close-btn" data-target="market-sentiment-container">✕</button></div>
        <div class="sub-chart-body" id="market-sentiment" style="padding:20px;">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center;">
            <div>
              <div style="font-size:32px;font-weight:700;color:var(--up);" id="up-count">0</div>
              <div style="font-size:12px;color:var(--text-sec);margin-top:4px;">上涨家数</div>
            </div>
            <div>
              <div style="font-size:32px;font-weight:700;color:var(--down);" id="down-count">0</div>
              <div style="font-size:12px;color:var(--text-sec);margin-top:4px;">下跌家数</div>
            </div>
            <div>
              <div style="font-size:32px;font-weight:700;color:#ff1744;" id="limit-up-count">0</div>
              <div style="font-size:12px;color:var(--text-sec);margin-top:4px;">涨停数</div>
            </div>
            <div>
              <div style="font-size:32px;font-weight:700;color:#00e676;" id="limit-down-count">0</div>
              <div style="font-size:12px;color:var(--text-sec);margin-top:4px;">跌停数</div>
            </div>
          </div>
          <div style="margin-top:20px;height:100px;display:flex;align-items:center;justify-content:center;">
            <div style="text-align:center;">
              <div style="font-size:14px;color:var(--text-sec);margin-bottom:8px;">市场强度</div>
              <div style="width:300px;height:20px;background:var(--glass-bg);border-radius:10px;overflow:hidden;border:1px solid var(--border);">
                <div id="market-strength-bar" style="height:100%;background:linear-gradient(90deg,var(--down),var(--up));width:50%;transition:width 0.3s;"></div>
              </div>
              <div id="market-strength-text" style="font-size:12px;color:var(--text-sec);margin-top:4px;">50%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="glass sub-chart" id="macd-chart-container">
        <div class="sub-chart-title"><span>MACD (12, 26, 9)</span><button class="close-btn" data-target="macd-chart-container">✕</button></div>
        <div class="sub-chart-body" id="macd-chart"></div>
      </div>
      <div class="glass sub-chart" id="kdj-chart-container">
        <div class="sub-chart-title"><span>KDJ (9, 3, 3)</span><button class="close-btn" data-target="kdj-chart-container">✕</button></div>
        <div class="sub-chart-body" id="kdj-chart"></div>
      </div>
    </section>

    <div class="marquee-wrap">
      <div class="marquee-label">⚡ 实时快讯</div>
      <div class="marquee-track">${window.createMarqueeTicker(window.MOCK_NEWS)}</div>
    </div>

    <div class="bottom-grid">
      <div class="glass sector-panel">
        <div class="section-head">
          <h3>💰 板块资金流向</h3>
          <div class="view-toggle" id="sector-view-toggle">
            <button class="vt active" data-view="bubble">气泡</button>
            <button class="vt" data-view="list">列表</button>
          </div>
        </div>
        <div id="sector-content"><div class="bubble-area"></div></div>
      </div>
      <div class="glass ranking-panel">
        <div class="section-head"><h3>📈 涨跌幅排行</h3></div>
        <div class="rank-cols">
          <div class="rank-col"><h4><span class="arrow-up">▲</span> 涨幅榜</h4><div class="rank-table" id="gainers-list"></div></div>
          <div class="rank-col"><h4><span class="arrow-down">▼</span> 跌幅榜</h4><div class="rank-table" id="losers-list"></div></div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div style="padding:16px 32px 0;">
      ${renderRecommendations()}
    </div>

    <footer class="footer">© 2026 <a href="#/">量子财富</a> — 智能交易平台 · 数据仅供参考，不构成投资建议</footer>
  `;

  setTimeout(initDashboardInteractions, 120);
}

// ========== 更新市场情绪数据 ==========
function updateMarketSentiment() {
  const stocks = window.MOCK_STOCKS || [];
  
  const upCount = stocks.filter(s => s.changePercent > 0).length;
  const downCount = stocks.filter(s => s.changePercent < 0).length;
  const flatCount = stocks.filter(s => s.changePercent === 0).length;
  const limitUpCount = stocks.filter(s => s.changePercent >= 9.9).length;
  const limitDownCount = stocks.filter(s => s.changePercent <= -9.9).length;
  
  const total = upCount + downCount + flatCount;
  const strength = total > 0 ? (upCount / total * 100) : 50;
  
  // 更新显示
  const upEl = document.getElementById('up-count');
  const downEl = document.getElementById('down-count');
  const limitUpEl = document.getElementById('limit-up-count');
  const limitDownEl = document.getElementById('limit-down-count');
  const strengthBar = document.getElementById('market-strength-bar');
  const strengthText = document.getElementById('market-strength-text');
  
  if (upEl) upEl.textContent = upCount;
  if (downEl) downEl.textContent = downCount;
  if (limitUpEl) limitUpEl.textContent = limitUpCount;
  if (limitDownEl) limitDownEl.textContent = limitDownCount;
  
  if (strengthBar) {
    strengthBar.style.width = strength + '%';
    strengthBar.style.background = strength >= 50 
      ? `linear-gradient(90deg, rgba(0,230,118,0.3), var(--up))`
      : `linear-gradient(90deg, var(--down), rgba(255,82,82,0.3))`;
  }
  
  if (strengthText) {
    const sentiment = strength >= 70 ? '强势' : strength >= 55 ? '偏强' : strength >= 45 ? '平衡' : strength >= 30 ? '偏弱' : '弱势';
    strengthText.textContent = `${strength.toFixed(1)}% · ${sentiment}`;
    strengthText.style.color = strength >= 50 ? 'var(--up)' : 'var(--down)';
  }
}

function initDashboardInteractions() {
  // Load chart
  loadIndexChart(window.APP_STATE.currentIndex);

  // Sector bubbles
  window.createSectorBubbles(window.MOCK_SECTORS);

  // Rankings
  document.getElementById('gainers-list').innerHTML = window.MOCK_RANKING.gainers.map((s, i) => window.createRankRow(s, i + 1)).join('');
  document.getElementById('losers-list').innerHTML = window.MOCK_RANKING.losers.map((s, i) => window.createRankRow(s, i + 1)).join('');

  // Update market sentiment
  updateMarketSentiment();

  // Index card click → switch chart
  document.querySelectorAll('.index-card').forEach(card => {
    card.addEventListener('click', function() {
      const code = this.getAttribute('data-code');
      const idx = window.MOCK_INDICES.find(i => i.code === code);
      if (idx) {
        window.APP_STATE.currentIndex = code;
        document.getElementById('chart-title').textContent = idx.name;
        // Highlight active card
        document.querySelectorAll('.index-card').forEach(c => c.style.outline = 'none');
        this.style.outline = '2px solid var(--primary)';
        this.style.outlineOffset = '-2px';
        loadIndexChart(code);
      }
    });
  });

  // Period tabs
  document.getElementById('period-tabs').addEventListener('click', function(e) {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    this.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.APP_STATE.currentPeriod = btn.dataset.period;
    loadIndexChart(window.APP_STATE.currentIndex);
  });

  // Indicator toggle
  document.getElementById('indicator-btns').addEventListener('click', function(e) {
    const btn = e.target.closest('.tool-btn');
    if (!btn) return;
    btn.classList.toggle('active');
    const ind = btn.dataset.indicator;
    const list = window.APP_STATE.activeIndicators;
    if (list.includes(ind)) list.splice(list.indexOf(ind), 1);
    else list.push(ind);
  });

  // Fullscreen
  document.getElementById('fullscreen-btn').addEventListener('click', function() {
    const area = document.getElementById('kline-area');
    if (!document.fullscreenElement) {
      (area.requestFullscreen || area.webkitRequestFullscreen || area.msRequestFullscreen).call(area);
      area.style.background = 'var(--bg)';
    } else {
      document.exitFullscreen();
    }
    setTimeout(() => { Object.values(window.APP_STATE.charts).forEach(c => c && c.resize && c.resize()); }, 300);
  });

  // Sub-chart close buttons
  document.querySelectorAll('.close-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const target = document.getElementById(this.dataset.target);
      if (target) {
        target.style.display = target.style.display === 'none' ? '' : 'none';
        this.textContent = target.style.display === 'none' ? '＋' : '✕';
        // Update grid
        const section = document.getElementById('sub-charts-section');
        const visible = section.querySelectorAll('.sub-chart:not([style*="display: none"])');
        section.style.gridTemplateColumns = `repeat(${visible.length || 1}, 1fr)`;
        setTimeout(() => { Object.values(window.APP_STATE.charts).forEach(c => c && c.resize && c.resize()); }, 100);
      }
    });
  });

  // Sector view toggle (bubble / list)
  document.getElementById('sector-view-toggle').addEventListener('click', function(e) {
    const btn = e.target.closest('.vt');
    if (!btn) return;
    this.querySelectorAll('.vt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    const content = document.getElementById('sector-content');
    if (view === 'bubble') {
      content.innerHTML = '<div class="bubble-area"></div>';
      window.createSectorBubbles(window.MOCK_SECTORS);
    } else {
      content.innerHTML = window.createSectorList(window.MOCK_SECTORS);
    }
  });

  // Ranking row click → go to stock
  document.querySelectorAll('.rank-row').forEach(row => {
    row.addEventListener('click', function() { navigateToStock(this.dataset.code); });
  });

  // Marquee click → go to news
  document.querySelectorAll('.marquee-item').forEach(item => {
    item.addEventListener('click', function() { navigate('news'); });
  });

  // Update realtime timestamp
  updateRealtimeTimestamp();
  setInterval(updateRealtimeTimestamp, 1000); // Update every second
}

// Update realtime timestamp display
function updateRealtimeTimestamp() {
  const el = document.getElementById('realtime-timestamp');
  if (!el) return;
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
  const timeStr = now.toTimeString().slice(0, 8);
  el.textContent = `${dateStr} ${timeStr}`;
}

function loadIndexChart(code) {
  const klineData = window.getIndexKLineData(code);
  if (!klineData) return;

  // Dispose old
  ['mainKline','macd','kdj'].forEach(k => {
    if (window.APP_STATE.charts[k]) { window.APP_STATE.charts[k].dispose(); delete window.APP_STATE.charts[k]; }
  });

  window.APP_STATE.charts.mainKline = window.createKLineChart('main-kline-chart', klineData, '日K线');

  if (document.getElementById('macd-chart-container').style.display !== 'none') {
    window.APP_STATE.charts.macd = window.createMACDChart('macd-chart', klineData);
  }
  if (document.getElementById('kdj-chart-container').style.display !== 'none') {
    window.APP_STATE.charts.kdj = window.createKDJChart('kdj-chart', klineData);
  }
}

// ========== Watchlist ==========
function renderWatchlist() {
  window.APP_STATE.currentPage = 'watchlist';
  const c = document.getElementById('app-content');

  let stocks = window.APP_STATE.watchlist.map(code => window.getStockByCode(code)).filter(Boolean);

  // Sort
  const sf = window.APP_STATE.sortField;
  const so = window.APP_STATE.sortOrder === 'asc' ? 1 : -1;
  if (sf) stocks.sort((a, b) => ((a[sf] || 0) - (b[sf] || 0)) * so);

  const upCount = stocks.filter(s => s.changePercent > 0).length;
  const downCount = stocks.filter(s => s.changePercent < 0).length;
  const flatCount = stocks.filter(s => s.changePercent === 0).length;
  const totalValue = stocks.reduce((sum, s) => sum + s.price * 100, 0);

  const emptyHTML = stocks.length === 0 ? `
    <div style="text-align:center;padding:60px 20px;color:var(--text-sec);">
      <div style="font-size:48px;margin-bottom:16px;">⭐</div>
      <div style="font-size:16px;margin-bottom:8px;">暂无自选股</div>
      <div style="font-size:13px;">在搜索框中搜索股票，或在个股页面点击"加入自选"</div>
    </div>
  ` : '';

  c.innerHTML = `
    <div class="page-header">
      <div class="page-title">⭐ 我的自选 <span class="count">${stocks.length} / 50</span></div>
      <div class="page-actions">
        <button class="action-btn" id="sort-btn">↕ 排序</button>
        <button class="action-btn primary-btn" id="add-stock-btn">＋ 添加自选</button>
      </div>
    </div>
    <div class="summary-bar">
      <div class="summary-item"><div class="summary-dot" style="background:var(--up)"></div>上涨 <span class="summary-val color-up">${upCount}</span></div>
      <div class="summary-item"><div class="summary-dot" style="background:var(--down)"></div>下跌 <span class="summary-val color-down">${downCount}</span></div>
      <div class="summary-item"><div class="summary-dot" style="background:var(--text-sec)"></div>平盘 <span class="summary-val">${flatCount}</span></div>
      <div class="summary-item" style="margin-left:auto;">自选总市值 <span class="summary-val color-primary">¥ ${window.formatMoney(totalValue)}</span></div>
    </div>
    ${stocks.length > 0 ? `
    <div class="glass watchlist-card">
      <div class="wl-header">
        <span></span>
        <span class="wl-sort-col" data-sort="code">代码 <span class="sort-icon">↕</span></span>
        <span>名称</span>
        <span class="wl-sort-col" data-sort="price">最新价 <span class="sort-icon">↕</span></span>
        <span class="wl-sort-col" data-sort="changePercent">涨跌幅 <span class="sort-icon">${sf === 'changePercent' ? (so === -1 ? '▼' : '▲') : '↕'}</span></span>
        <span>涨跌额</span>
        <span class="wl-sort-col" data-sort="volume">成交量 <span class="sort-icon">↕</span></span>
        <span class="wl-sort-col" data-sort="amount">成交额 <span class="sort-icon">↕</span></span>
        <span>日内走势</span>
        <span></span>
      </div>
      ${stocks.map(s => window.createWatchlistRow(s)).join('')}
    </div>` : emptyHTML}
    <footer class="footer">© 2026 <a href="#/">量子财富</a> — 自选股数据实时更新，最多支持50只 · 数据存储于浏览器本地</footer>
  `;

  setTimeout(() => {
    // Row click → stock detail
    document.querySelectorAll('.wl-row').forEach(row => {
      row.addEventListener('click', function(e) {
        if (e.target.closest('.wl-del')) return;
        navigateToStock(this.dataset.code);
      });
    });

    // Column sort
    document.querySelectorAll('.wl-sort-col').forEach(col => {
      col.style.cursor = 'pointer';
      col.addEventListener('click', function() {
        const field = this.dataset.sort;
        if (window.APP_STATE.sortField === field) {
          window.APP_STATE.sortOrder = window.APP_STATE.sortOrder === 'desc' ? 'asc' : 'desc';
        } else {
          window.APP_STATE.sortField = field;
          window.APP_STATE.sortOrder = 'desc';
        }
        renderWatchlist();
      });
    });

    // Sort button → cycle sort
    const sortBtn = document.getElementById('sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', function() {
        const fields = ['changePercent', 'price', 'volume', 'amount'];
        const cur = fields.indexOf(window.APP_STATE.sortField);
        window.APP_STATE.sortField = fields[(cur + 1) % fields.length];
        window.APP_STATE.sortOrder = 'desc';
        renderWatchlist();
        showToast('按 ' + {changePercent:'涨跌幅',price:'价格',volume:'成交量',amount:'成交额'}[window.APP_STATE.sortField] + ' 排序');
      });
    }

    // Add stock button → focus search
    const addBtn = document.getElementById('add-stock-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) { searchInput.focus(); searchInput.value = ''; }
        showToast('请在搜索框中输入股票代码或名称');
      });
    }
  }, 50);
}

window.removeFromWatchlist = function(code) {
  window.APP_STATE.watchlist = window.APP_STATE.watchlist.filter(c => c !== code);
  saveWatchlist();
  if (window.APP_STATE.currentPage === 'watchlist') renderWatchlist();
  showToast('已移除自选');
};

window.addToWatchlist = function(code) {
  if (!window.APP_STATE.watchlist.includes(code) && window.APP_STATE.watchlist.length < 50) {
    window.APP_STATE.watchlist.push(code);
    saveWatchlist();
    showToast('已添加自选');
    return true;
  } else if (window.APP_STATE.watchlist.includes(code)) {
    showToast('已在自选中');
  } else {
    showToast('自选股已满 (50只)');
  }
  return false;
};

// ========== News ==========
function renderNews() {
  window.APP_STATE.currentPage = 'news';
  const c = document.getElementById('app-content');
  const selectedNews = window.APP_STATE.selectedNews || window.MOCK_NEWS[0];
  const filter = window.APP_STATE.newsFilter;

  const filteredNews = filter === '全部' ? window.MOCK_NEWS : window.MOCK_NEWS.filter(n => n.category === filter);
  const categories = ['全部', '宏观政策', '公司公告', '行业动态', '市场数据', '研报观点', '海外市场'];

  c.innerHTML = `
    <div class="page-header">
      <div class="page-title">⚡ 实时快讯</div>
      <span style="font-size:12px;color:var(--text-sec);font-family:var(--mono);">
        实时推送 · WebSocket 连接中
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--up);vertical-align:middle;margin-left:4px;animation:pulse 2s infinite;"></span>
      </span>
    </div>
    <div class="filter-bar" id="news-filter" style="padding:0 32px;">
      ${categories.map(cat => `<button class="filter-tab${cat === filter ? ' active' : ''}" data-category="${cat}">${cat}</button>`).join('')}
    </div>
    <div class="news-layout">
      <div class="timeline" id="news-timeline">
        ${filteredNews.map((news, idx) => window.createNewsItem(news, idx === 0)).join('')}
        ${filteredNews.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-sec);">该分类暂无快讯</div>' : ''}
        <div class="load-more"><button class="load-btn" id="load-more-btn">加载更多快讯 ↓</button></div>
      </div>
      <div class="detail-panel">
        <div class="glass" id="news-detail-panel">${window.createNewsDetail(selectedNews)}</div>
      </div>
    </div>
    <footer class="footer">© 2026 <a href="#/">量子财富</a> — 新闻来源于公开信息整合，不构成投资建议</footer>
  `;

  setTimeout(() => {
    // Filter tabs
    document.getElementById('news-filter').addEventListener('click', function(e) {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      this.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.APP_STATE.newsFilter = btn.dataset.category;
      renderNews();
    });

    // Load more
    document.getElementById('load-more-btn').addEventListener('click', function() {
      this.textContent = '暂无更多快讯';
      this.style.opacity = '0.5';
      this.style.pointerEvents = 'none';
    });
  }, 50);
}

window.selectNews = function(newsId) {
  const news = window.MOCK_NEWS.find(n => n.id === newsId);
  if (!news) return;
  window.APP_STATE.selectedNews = news;
  document.querySelectorAll('.news-item').forEach(item => {
    item.classList.toggle('selected', parseInt(item.dataset.id) === newsId);
  });
  const panel = document.getElementById('news-detail-panel');
  if (panel) panel.innerHTML = window.createNewsDetail(news);
};

// ========== Stock Detail ==========
async function renderStockDetail(code) {
  window.APP_STATE.currentPage = 'stock';
  window.APP_STATE.currentStock = code;
  const c = document.getElementById('app-content');
  
  // 如果数据还未加载，等待加载
  if (!window.MOCK_STOCKS || window.MOCK_STOCKS.length === 0) {
    c.innerHTML = `<div style="text-align:center;padding:80px;color:var(--text-sec);">
      <div style="font-size:48px;margin-bottom:16px;">⏳</div>
      <div style="font-size:18px;margin-bottom:8px;">加载中...</div>
    </div>`;
    
    // 等待API数据加载
    if (typeof window.loadAllData === 'function') {
      await window.loadAllData();
    }
  }
  
  const stock = window.getStockByCode(code);

  if (!stock) {
    c.innerHTML = `<div style="text-align:center;padding:80px;color:var(--text-sec);">
      <div style="font-size:48px;margin-bottom:16px;">🔍</div>
      <div style="font-size:18px;margin-bottom:8px;">未找到股票 ${code}</div>
      <button class="action-btn primary-btn" onclick="navigate('dashboard')" style="margin-top:16px;">返回首页</button>
    </div>`;
    return;
  }

  const isUp = stock.changePercent >= 0;
  const colorClass = isUp ? 'color-up' : 'color-down';
  const isInWatchlist = window.APP_STATE.watchlist.includes(code);

  // Related news
  const relatedNews = window.MOCK_NEWS.filter(n => n.stocks && n.stocks.includes(code)).slice(0, 3);

  c.innerHTML = `
    <div class="stock-header">
      <div class="stock-info">
        <div class="stock-name-row">
          <span class="stock-name">${stock.name}</span>
          <span class="stock-code">${stock.code}.${stock.market}</span>
          <button class="star-btn" id="star-btn">${isInWatchlist ? '⭐ 已自选' : '☆ 加入自选'}</button>
        </div>
        <div class="stock-tags">${stock.tags.map(tag => `<span class="stock-tag">${tag}</span>`).join('')}</div>
        <div class="stock-meta">
          <span>今开 ${stock.open.toFixed(2)}</span>
          <span>昨收 ${stock.prevClose.toFixed(2)}</span>
          <span>成交额 ${window.formatMoney(stock.amount)}</span>
          <span>换手率 ${stock.turnover.toFixed(2)}%</span>
        </div>
      </div>
      <div class="stock-price-block">
        <div class="stock-current ${colorClass}">${stock.price.toFixed(2)}</div>
        <div class="stock-change-row">
          <span class="stock-change ${colorClass}">${isUp ? '+' : ''}${stock.change.toFixed(2)}</span>
          <span class="stock-change ${colorClass}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div>
        <div class="glass chart-container" style="padding:16px 18px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div class="tab-row" id="stock-period-tabs">
              ${['日K','周K','月K','分时','5日','15min','60min'].map((label, i) => {
                return `<button class="tab-btn${i === 0 ? ' active' : ''}">${label}</button>`;
              }).join('')}
            </div>
            <div class="chart-tools" id="stock-indicator-btns">
              ${['MA','MACD','KDJ','RSI','BOLL'].map(ind => {
                const key = ind.toLowerCase();
                return `<button class="tool-btn${['ma','macd'].includes(key) ? ' active' : ''}" data-indicator="${key}">${ind}</button>`;
              }).join('')}
            </div>
          </div>
          <div id="stock-kline-chart" style="width:100%;height:380px;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div class="glass sub-chart"><div class="sub-chart-title">MACD (12, 26, 9)</div><div class="sub-chart-body" id="stock-macd-chart"></div></div>
          <div class="glass sub-chart"><div class="sub-chart-title">KDJ (9, 3, 3)</div><div class="sub-chart-body" id="stock-kdj-chart"></div></div>
        </div>
        ${relatedNews.length > 0 ? `
        <div class="glass" style="margin-top:16px;padding:16px 18px;">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px;">📰 相关新闻</div>
          ${relatedNews.map(n => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="navigate('news'); setTimeout(()=>selectNews(${n.id}),100);">
              <div style="font-size:13px;font-weight:500;">${n.headline}</div>
              <div style="font-size:11px;color:var(--text-sec);margin-top:4px;">${n.time} · ${n.source}</div>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
      <div>
        <div class="glass quote-panel">
          <div class="quote-title">📋 行情数据</div>
          <div class="quote-grid">
            ${[
              ['今开', stock.open.toFixed(2), isUp ? 'color-up' : 'color-down'],
              ['昨收', stock.prevClose.toFixed(2), ''],
              ['最高', stock.high.toFixed(2), 'color-up'],
              ['最低', stock.low.toFixed(2), 'color-down'],
              ['成交量', window.formatNumber(stock.volume) + '手', ''],
              ['成交额', window.formatMoney(stock.amount), ''],
              ['振幅', (((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2) + '%', ''],
              ['换手率', stock.turnover.toFixed(2) + '%', ''],
              ['总市值', window.formatMoney(stock.marketCap), ''],
              ['流通值', window.formatMoney(stock.marketCap * 0.85), ''],
              ['市盈率', stock.pe.toFixed(1), ''],
              ['市净率', stock.pb.toFixed(1), ''],
            ].map(([label, value, cls]) => `<div class="quote-item"><div class="quote-label">${label}</div><div class="quote-value ${cls}">${value}</div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">© 2026 <a href="#/">量子财富</a> — 智能交易平台 · 数据仅供参考</footer>
  `;

  setTimeout(() => {
    window.APP_STATE.charts.stockKline = window.createKLineChart('stock-kline-chart', stock.klineData, '日K线');
    window.APP_STATE.charts.stockMacd = window.createMACDChart('stock-macd-chart', stock.klineData);
    window.APP_STATE.charts.stockKdj = window.createKDJChart('stock-kdj-chart', stock.klineData);

    // Star button
    document.getElementById('star-btn').addEventListener('click', function() {
      if (window.APP_STATE.watchlist.includes(code)) {
        window.APP_STATE.watchlist = window.APP_STATE.watchlist.filter(c => c !== code);
        saveWatchlist();
        this.textContent = '☆ 加入自选';
        showToast('已移除自选');
      } else {
        window.addToWatchlist(code);
        this.textContent = '⭐ 已自选';
      }
    });

    // Period tabs
    document.getElementById('stock-period-tabs').addEventListener('click', function(e) {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      this.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    // Indicator btns
    document.getElementById('stock-indicator-btns').addEventListener('click', function(e) {
      const btn = e.target.closest('.tool-btn');
      if (!btn) return;
      btn.classList.toggle('active');
    });
  }, 120);
}

window.toggleWatchlist = function(code) {
  if (window.APP_STATE.watchlist.includes(code)) {
    window.removeFromWatchlist(code);
  } else {
    window.addToWatchlist(code);
  }
};

// ========== Sector Detail Page ==========
function renderSectorDetail(sectorName) {
  window.APP_STATE.currentPage = 'sector';
  const c = document.getElementById('app-content');
  const sector = window.MOCK_SECTORS.find(s => s.name === sectorName);
  const stocks = window.getSectorStocks(sectorName);

  if (!sector) {
    c.innerHTML = `<div style="text-align:center;padding:80px;color:var(--text-sec);">
      <div style="font-size:48px;margin-bottom:16px;">🏢</div>
      <div style="font-size:18px;margin-bottom:8px;">未找到板块「${sectorName}」</div>
      <button class="action-btn primary-btn" onclick="navigate('dashboard')" style="margin-top:16px;">返回首页</button>
    </div>`;
    return;
  }

  const isPos = sector.flow >= 0;
  const flowColor = isPos ? 'color-up' : 'color-down';

  c.innerHTML = `
    <div class="page-header">
      <div class="page-title">
        <span style="cursor:pointer;opacity:0.6;margin-right:8px;" onclick="navigate('dashboard')">← 返回</span>
        🏢 ${sectorName}板块
      </div>
      <div style="text-align:right;">
        <div class="${flowColor}" style="font-family:var(--mono);font-size:24px;font-weight:700;">${isPos ? '+' : ''}${(sector.flow / 100000000).toFixed(1)}亿</div>
        <div style="font-size:12px;color:var(--text-sec);">今日净流入</div>
      </div>
    </div>

    <div style="padding:0 32px;">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
        <div class="glass" style="padding:16px;text-align:center;">
          <div style="font-size:12px;color:var(--text-sec);margin-bottom:4px;">板块涨跌</div>
          <div class="${flowColor}" style="font-family:var(--mono);font-size:20px;font-weight:700;">${isPos ? '+' : ''}${sector.changePercent.toFixed(2)}%</div>
        </div>
        <div class="glass" style="padding:16px;text-align:center;">
          <div style="font-size:12px;color:var(--text-sec);margin-bottom:4px;">成分股数</div>
          <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--primary);">${stocks.length}</div>
        </div>
        <div class="glass" style="padding:16px;text-align:center;">
          <div style="font-size:12px;color:var(--text-sec);margin-bottom:4px;">资金方向</div>
          <div style="font-size:20px;font-weight:700;color:${isPos ? 'var(--up)' : 'var(--down)'};">${isPos ? '📈 流入' : '📉 流出'}</div>
        </div>
      </div>

      <div class="glass" style="padding:0;overflow:hidden;margin-bottom:24px;">
        <div style="padding:16px 18px;font-size:14px;font-weight:600;border-bottom:1px solid var(--border);">📊 板块成分股</div>
        <div style="display:grid;grid-template-columns:80px 100px 100px 90px 120px;padding:10px 18px;font-size:11px;color:var(--text-sec);border-bottom:1px solid var(--border);background:rgba(10,14,23,0.3);">
          <span>代码</span><span>名称</span><span>最新价</span><span>涨跌幅</span><span>资金净流入</span>
        </div>
        ${stocks.map(s => {
          const sUp = s.changePercent >= 0;
          const sColor = sUp ? 'color-up' : 'color-down';
          const sFlowPos = s.flow >= 0;
          return `<div style="display:grid;grid-template-columns:80px 100px 100px 90px 120px;padding:12px 18px;font-size:13px;border-bottom:1px solid rgba(48,54,61,0.15);cursor:pointer;transition:background .12s;" onmouseover="this.style.background='rgba(0,212,255,0.03)'" onmouseout="this.style.background='transparent'" onclick="navigateToStock('${s.code}')">
            <span style="font-family:var(--mono);color:var(--primary);font-size:12px;">${s.code}</span>
            <span style="font-weight:500;">${s.name}</span>
            <span class="${sColor}" style="font-family:var(--mono);font-weight:600;">${s.price.toFixed(2)}</span>
            <span class="${sColor}" style="font-family:var(--mono);font-weight:600;">${sUp ? '+' : ''}${s.changePercent.toFixed(2)}%</span>
            <span style="font-family:var(--mono);font-size:12px;color:${sFlowPos ? 'var(--up)' : 'var(--down)'};">${sFlowPos ? '+' : ''}${(s.flow / 100000000).toFixed(1)}亿</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <footer class="footer">© 2026 <a href="#/">量子财富</a> — 智能交易平台 · 数据仅供参考</footer>
  `;
}

// ========== Recommendations Module (rendered in dashboard) ==========
function renderRecommendations() {
  return `
    <div class="glass" style="padding:0;overflow:hidden;">
      <div style="padding:16px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);">
        <div style="font-size:16px;font-weight:600;">🎯 AI 精选推荐</div>
        <div style="font-size:11px;color:var(--text-sec);">基于量化模型 · 仅供参考</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;">
        ${window.MOCK_RECOMMENDATIONS.map(r => {
          const isUp = r.changePercent >= 0;
          const upside = ((r.targetPrice - r.currentPrice) / r.currentPrice * 100).toFixed(1);
          return `<div class="rec-card" style="padding:18px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s;" onmouseover="this.style.background='rgba(0,212,255,0.03)'" onmouseout="this.style.background='transparent'" onclick="navigateToStock('${r.code}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <div>
                <div style="font-size:14px;font-weight:600;">${r.name}</div>
                <div style="font-family:var(--mono);font-size:11px;color:var(--primary);">${r.code} · ${r.sector}</div>
              </div>
              <span style="padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;background:${r.ratingColor}22;color:${r.ratingColor};border:1px solid ${r.ratingColor}44;">${r.rating}</span>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:10px;">
              <div>
                <div style="font-size:10px;color:var(--text-sec);">当前价</div>
                <div class="${isUp ? 'color-up' : 'color-down'}" style="font-family:var(--mono);font-size:16px;font-weight:700;">${r.currentPrice.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size:10px;color:var(--text-sec);">目标价</div>
                <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--primary);">${r.targetPrice.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size:10px;color:var(--text-sec);">上涨空间</div>
                <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--up);">+${upside}%</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-sec);line-height:1.5;margin-bottom:8px;">${r.reason}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
              ${r.highlights.map(h => `<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(0,212,255,0.08);color:var(--primary);">${h}</span>`).join('')}
            </div>
            <div style="font-size:10px;padding:8px 10px;border-radius:6px;background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.12);color:var(--up);line-height:1.4;">
              💡 <strong>操作建议：</strong>${r.strategy}
            </div>
            <div style="font-size:10px;color:var(--down);margin-top:6px;opacity:0.7;">⚠️ ${r.risk}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ========== Toast notification ==========
function showToast(msg) {
  let toast = document.getElementById('qv-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'qv-toast';
    toast.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%) translateY(-20px);padding:10px 24px;border-radius:8px;background:var(--bg-card-solid);border:1px solid var(--primary);color:var(--primary);font-size:13px;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;backdrop-filter:blur(12px);box-shadow:0 4px 16px rgba(0,0,0,0.3);';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2000);
}
window.showToast = showToast;
