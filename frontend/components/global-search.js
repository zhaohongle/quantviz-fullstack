// ========== 全局搜索组件 ==========

class GlobalSearch {
  constructor() {
    this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    this.hotStocks = ['600519', '000858', '002594', '601318', '688981']; // 热门股票
    this.isSearching = false;
    this.searchTimeout = null;
    
    this.init();
  }

  init() {
    // 创建搜索界面
    this.createSearchUI();
    
    // 绑定快捷键
    this.bindShortcuts();
    
    // 监听路由变化（确保搜索框在所有页面都可见）
    this.ensureSearchBoxVisible();
  }

  createSearchUI() {
    // 搜索按钮（添加到导航栏）
    const searchButton = `
      <button class="nav-btn search-trigger" onclick="globalSearch.openSearch()" title="搜索 (Ctrl+K)">
        🔍
      </button>
    `;

    // 搜索弹窗
    const searchModal = document.createElement('div');
    searchModal.id = 'globalSearchModal';
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
      <div class="search-modal-overlay" onclick="globalSearch.closeSearch()"></div>
      <div class="search-modal-content">
        <div class="search-header">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="globalSearchInput" 
              class="search-input" 
              placeholder="搜索股票代码或名称..."
              autocomplete="off"
            >
            <button class="search-clear" onclick="globalSearch.clearInput()">×</button>
          </div>
          <button class="search-close" onclick="globalSearch.closeSearch()">ESC</button>
        </div>

        <div class="search-body">
          <!-- 搜索结果 -->
          <div id="searchResults" class="search-results"></div>

          <!-- 搜索历史 -->
          <div id="searchHistory" class="search-section">
            <div class="search-section-header">
              <span>🕐 最近搜索</span>
              <button onclick="globalSearch.clearHistory()">清空</button>
            </div>
            <div id="historyList" class="search-list"></div>
          </div>

          <!-- 热门搜索 -->
          <div id="hotSearches" class="search-section">
            <div class="search-section-header">
              <span>🔥 热门搜索</span>
            </div>
            <div id="hotList" class="search-list"></div>
          </div>
        </div>

        <div class="search-footer">
          <div class="search-tips">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>ESC</kbd> 关闭</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(searchModal);

    // 添加样式
    this.addSearchStyles();

    // 绑定输入事件
    const input = document.getElementById('globalSearchInput');
    input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    input.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // 显示初始内容
    this.showHistory();
    this.showHotSearches();
  }

  addSearchStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .search-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        animation: fadeIn 0.2s ease;
      }

      .search-modal.active {
        display: block;
      }

      .search-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
      }

      .search-modal-content {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 640px;
        background: #1a1a2e;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideDown 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      .search-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .search-input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 0.75rem 1rem;
        transition: all 0.3s;
      }

      .search-input-wrapper:focus-within {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(102, 126, 234, 0.5);
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      .search-icon {
        font-size: 1.2rem;
        margin-right: 0.75rem;
        opacity: 0.6;
      }

      .search-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: white;
        font-size: 1rem;
      }

      .search-clear {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0 0.5rem;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .search-input:not(:placeholder-shown) + .search-clear {
        opacity: 1;
      }

      .search-close {
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
      }

      .search-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .search-body {
        max-height: 60vh;
        overflow-y: auto;
        padding: 1rem;
      }

      .search-results {
        margin-bottom: 1rem;
      }

      .search-section {
        margin-bottom: 1.5rem;
      }

      .search-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #888;
      }

      .search-section-header button {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .search-section-header button:hover {
        background: rgba(102, 126, 234, 0.1);
      }

      .search-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .search-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .search-item:hover,
      .search-item.selected {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(102, 126, 234, 0.5);
        transform: translateX(4px);
      }

      .search-item-left {
        flex: 1;
      }

      .search-item-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .search-item-code {
        font-size: 0.9rem;
        color: #888;
      }

      .search-item-right {
        text-align: right;
      }

      .search-item-price {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .search-item-change {
        font-size: 0.9rem;
      }

      .search-item-change.positive {
        color: #34c759;
      }

      .search-item-change.negative {
        color: #ff3b30;
      }

      .search-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        border-radius: 0 0 16px 16px;
      }

      .search-tips {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        font-size: 0.85rem;
        color: #888;
      }

      .search-tips kbd {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: monospace;
        margin: 0 0.25rem;
      }

      .search-loading {
        text-align: center;
        padding: 2rem;
        color: #888;
      }

      .search-empty {
        text-align: center;
        padding: 3rem 2rem;
        color: #888;
      }

      .search-empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      /* 移动端优化 */
      @media (max-width: 768px) {
        .search-modal-content {
          top: 5%;
          width: 95%;
        }

        .search-body {
          max-height: 70vh;
        }

        .search-tips {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  openSearch() {
    const modal = document.getElementById('globalSearchModal');
    modal.classList.add('active');
    
    const input = document.getElementById('globalSearchInput');
    input.focus();
    
    // 显示历史和热门
    this.showHistory();
    this.showHotSearches();
  }

  closeSearch() {
    const modal = document.getElementById('globalSearchModal');
    modal.classList.remove('active');
    this.clearInput();
  }

  clearInput() {
    const input = document.getElementById('globalSearchInput');
    input.value = '';
    this.showHistory();
    this.showHotSearches();
  }

  async handleSearch(query) {
    const resultsDiv = document.getElementById('searchResults');
    const historyDiv = document.getElementById('searchHistory');
    const hotDiv = document.getElementById('hotSearches');

    if (!query || query.length < 2) {
      resultsDiv.innerHTML = '';
      historyDiv.style.display = 'block';
      hotDiv.style.display = 'block';
      return;
    }

    // 隐藏历史和热门
    historyDiv.style.display = 'none';
    hotDiv.style.display = 'none';

    // 防抖
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(async () => {
      resultsDiv.innerHTML = '<div class="search-loading">搜索中...</div>';

      try {
        const results = await window.API_Integration.fetchFilteredStocks({
          keyword: query,
          limit: 10
        });

        if (!results || results.length === 0) {
          resultsDiv.innerHTML = `
            <div class="search-empty">
              <div class="search-empty-icon">🔍</div>
              <div>未找到相关股票</div>
            </div>
          `;
          return;
        }

        this.renderResults(results);
      } catch (error) {
        console.error('搜索失败:', error);
        resultsDiv.innerHTML = `
          <div class="search-empty">
            <div class="search-empty-icon">⚠️</div>
            <div style="color: #ff3b30;">搜索失败: ${error.message}</div>
          </div>
        `;
      }
    }, 300);
  }

  renderResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    
    const html = `
      <div class="search-section">
        <div class="search-section-header">
          <span>🎯 搜索结果 (${results.length})</span>
        </div>
        <div class="search-list">
          ${results.map((stock, index) => `
            <div class="search-item" data-index="${index}" onclick="globalSearch.selectStock('${stock.code}', '${stock.name}')">
              <div class="search-item-left">
                <div class="search-item-name">${stock.name}</div>
                <div class="search-item-code">${stock.code}</div>
              </div>
              <div class="search-item-right">
                <div class="search-item-price">¥${stock.price?.toFixed(2) || '--'}</div>
                <div class="search-item-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                  ${stock.change >= 0 ? '↗' : '↘'} ${stock.changePercent?.toFixed(2) || 0}%
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    resultsDiv.innerHTML = html;
  }

  showHistory() {
    const historyList = document.getElementById('historyList');
    
    if (this.searchHistory.length === 0) {
      document.getElementById('searchHistory').style.display = 'none';
      return;
    }

    document.getElementById('searchHistory').style.display = 'block';

    const html = this.searchHistory.slice(0, 5).map(item => `
      <div class="search-item" onclick="globalSearch.selectStock('${item.code}', '${item.name}')">
        <div class="search-item-left">
          <div class="search-item-name">${item.name}</div>
          <div class="search-item-code">${item.code}</div>
        </div>
      </div>
    `).join('');

    historyList.innerHTML = html;
  }

  async showHotSearches() {
    const hotList = document.getElementById('hotList');
    
    try {
      // 获取热门股票数据
      const promises = this.hotStocks.map(code => 
        window.API_Integration.fetchStockQuote(code).catch(() => null)
      );
      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);

      const html = validResults.map(stock => `
        <div class="search-item" onclick="globalSearch.selectStock('${stock.code}', '${stock.name}')">
          <div class="search-item-left">
            <div class="search-item-name">${stock.name}</div>
            <div class="search-item-code">${stock.code}</div>
          </div>
          <div class="search-item-right">
            <div class="search-item-price">¥${stock.price?.toFixed(2) || '--'}</div>
            <div class="search-item-change ${stock.change >= 0 ? 'positive' : 'negative'}">
              ${stock.change >= 0 ? '↗' : '↘'} ${stock.changePercent?.toFixed(2) || 0}%
            </div>
          </div>
        </div>
      `).join('');

      hotList.innerHTML = html;
    } catch (error) {
      console.error('加载热门搜索失败:', error);
    }
  }

  selectStock(code, name) {
    // 添加到搜索历史
    this.addToHistory(code, name);
    
    // 关闭搜索
    this.closeSearch();
    
    // 跳转到详情页
    window.location.href = `/pages/stocks/detail.html?code=${code}`;
  }

  addToHistory(code, name) {
    // 移除重复项
    this.searchHistory = this.searchHistory.filter(item => item.code !== code);
    
    // 添加到开头
    this.searchHistory.unshift({ code, name, searchedAt: new Date().toISOString() });
    
    // 最多保存20条
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(0, 20);
    }
    
    // 保存到 localStorage
    localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
  }

  clearHistory() {
    if (!confirm('确定要清空搜索历史吗？')) return;
    
    this.searchHistory = [];
    localStorage.removeItem('search_history');
    this.showHistory();
  }

  handleKeyboard(e) {
    const items = document.querySelectorAll('.search-item');
    const selected = document.querySelector('.search-item.selected');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!selected && items.length > 0) {
        items[0].classList.add('selected');
        items[0].scrollIntoView({ block: 'nearest' });
      } else if (selected) {
        const index = Array.from(items).indexOf(selected);
        if (index < items.length - 1) {
          selected.classList.remove('selected');
          items[index + 1].classList.add('selected');
          items[index + 1].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selected) {
        const index = Array.from(items).indexOf(selected);
        if (index > 0) {
          selected.classList.remove('selected');
          items[index - 1].classList.add('selected');
          items[index - 1].scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected) {
        selected.click();
      }
    } else if (e.key === 'Escape') {
      this.closeSearch();
    }
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      
      // ESC 关闭搜索
      if (e.key === 'Escape') {
        this.closeSearch();
      }
    });
  }

  ensureSearchBoxVisible() {
    // 确保导航栏加载后添加搜索按钮
    const checkNav = setInterval(() => {
      const navRight = document.querySelector('.nav-right');
      if (navRight && !document.querySelector('.search-trigger')) {
        const searchBtn = document.createElement('button');
        searchBtn.className = 'nav-btn search-trigger';
        searchBtn.title = '搜索 (Ctrl+K)';
        searchBtn.textContent = '🔍';
        searchBtn.onclick = () => this.openSearch();
        navRight.insertBefore(searchBtn, navRight.firstChild);
        clearInterval(checkNav);
      }
    }, 100);

    setTimeout(() => clearInterval(checkNav), 5000);
  }
}

// 初始化全局搜索
let globalSearch;
document.addEventListener('DOMContentLoaded', () => {
  globalSearch = new GlobalSearch();
});

// 确保在所有页面都可用
window.globalSearch = globalSearch;
