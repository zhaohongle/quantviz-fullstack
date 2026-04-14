// ========== 移动端优化 ==========

class MobileOptimizer {
  constructor() {
    this.isMobile = this.checkMobile();
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isSwipping = false;
    
    this.init();
  }

  init() {
    if (this.isMobile) {
      // 添加移动端样式
      this.addMobileStyles();
      
      // 添加底部导航栏
      this.addMobileNavBar();
      
      // 启用手势操作
      this.enableGestures();
      
      // 启用下拉刷新
      this.enablePullToRefresh();
      
      // 优化图表触摸
      this.optimizeChartTouch();
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.isMobile = this.checkMobile();
      if (this.isMobile) {
        this.addMobileNavBar();
      } else {
        this.removeMobileNavBar();
      }
    });
  }

  checkMobile() {
    return window.innerWidth <= 768;
  }

  // ========== 移动端样式 ==========

  addMobileStyles() {
    if (document.getElementById('mobile-optimizer-styles')) return;

    const style = document.createElement('style');
    style.id = 'mobile-optimizer-styles';
    style.textContent = `
      /* ========== 移动端全局优化 ========== */
      @media (max-width: 768px) {
        body {
          font-size: 14px;
        }

        /* 隐藏桌面导航 */
        .topnav {
          padding: 1rem;
        }

        .topnav .search-box {
          display: none;
        }

        .topnav .nav-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* 内容区域底部留空 */
        #app-content,
        .page {
          padding-bottom: 80px;
        }

        /* 优化卡片布局 */
        .stock-card,
        .watchlist-grid,
        .search-item {
          margin-bottom: 0.75rem;
        }

        /* 优化按钮大小 */
        button,
        .nav-btn,
        .refresh-btn {
          min-height: 44px;
          min-width: 44px;
        }

        /* 优化输入框 */
        input,
        textarea,
        select {
          font-size: 16px; /* 防止 iOS 自动缩放 */
        }

        /* 优化表格 */
        table {
          font-size: 12px;
        }

        /* 隐藏滚动条 */
        ::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      }

      /* ========== 底部导航栏 ========== */
      .mobile-nav-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: rgba(26, 26, 46, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-around;
        padding: 0.5rem 0;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
      }

      .mobile-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        color: #888;
        text-decoration: none;
        transition: all 0.3s;
        cursor: pointer;
      }

      .mobile-nav-item.active {
        color: #667eea;
      }

      .mobile-nav-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }

      .mobile-nav-label {
        font-size: 0.75rem;
      }

      /* ========== 手势提示 ========== */
      .swipe-indicator {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
        padding: 1rem;
        border-radius: 8px;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 999;
        pointer-events: none;
      }

      .swipe-indicator.left {
        left: 10px;
      }

      .swipe-indicator.right {
        right: 10px;
      }

      .swipe-indicator.show {
        opacity: 1;
      }

      /* ========== 下拉刷新 ========== */
      .pull-to-refresh {
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0 0 12px 12px;
        transition: top 0.3s;
        z-index: 9998;
      }

      .pull-to-refresh.show {
        top: 0;
      }

      .pull-to-refresh-icon {
        font-size: 1.2rem;
        animation: spin 1s linear infinite;
      }

      /* ========== 触摸优化 ========== */
      .touch-optimized {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      /* 图表触摸区域扩大 */
      canvas {
        touch-action: none;
      }

      /* ========== 小屏幕适配 (<375px) ========== */
      @media (max-width: 375px) {
        body {
          font-size: 13px;
        }

        .mobile-nav-bar {
          padding: 0.25rem 0;
        }

        .mobile-nav-icon {
          font-size: 1.3rem;
        }

        .mobile-nav-label {
          font-size: 0.7rem;
        }

        .stock-card,
        .search-item {
          padding: 0.75rem;
        }

        h1 {
          font-size: 1.5rem;
        }

        h2 {
          font-size: 1.2rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ========== 底部导航栏 ==========

  addMobileNavBar() {
    // 移除现有导航栏
    this.removeMobileNavBar();

    const navBar = document.createElement('div');
    navBar.id = 'mobileNavBar';
    navBar.className = 'mobile-nav-bar';
    navBar.innerHTML = `
      <a href="/" class="mobile-nav-item active" data-page="home">
        <div class="mobile-nav-icon">🏠</div>
        <div class="mobile-nav-label">首页</div>
      </a>
      <a href="/pages/stocks/kline.html" class="mobile-nav-item" data-page="stocks">
        <div class="mobile-nav-icon">📊</div>
        <div class="mobile-nav-label">行情</div>
      </a>
      <a href="/pages/watchlist/watchlist.html" class="mobile-nav-item" data-page="watchlist">
        <div class="mobile-nav-icon">⭐</div>
        <div class="mobile-nav-label">自选</div>
      </a>
      <a href="/pages/ai/recommendations.html" class="mobile-nav-item" data-page="ai">
        <div class="mobile-nav-icon">🤖</div>
        <div class="mobile-nav-label">AI</div>
      </a>
      <a href="/pages/settings/settings.html" class="mobile-nav-item" data-page="settings">
        <div class="mobile-nav-icon">⚙️</div>
        <div class="mobile-nav-label">设置</div>
      </a>
    `;

    document.body.appendChild(navBar);

    // 高亮当前页面
    this.highlightCurrentPage();
  }

  removeMobileNavBar() {
    const navBar = document.getElementById('mobileNavBar');
    if (navBar) {
      navBar.remove();
    }
  }

  highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.mobile-nav-item');

    navItems.forEach(item => {
      const page = item.dataset.page;
      const href = item.getAttribute('href');
      
      if (currentPath.includes(href) || (page === 'home' && currentPath === '/')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ========== 手势操作 ==========

  enableGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
      endY = e.touches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // 显示滑动提示
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        this.showSwipeIndicator(deltaX > 0 ? 'right' : 'left');
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // 横向滑动（切换页面）
      if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      }

      this.hideSwipeIndicator();
    }, { passive: true });
  }

  handleSwipeLeft() {
    // 向左滑动：下一页
    const navItems = Array.from(document.querySelectorAll('.mobile-nav-item'));
    const activeIndex = navItems.findIndex(item => item.classList.contains('active'));
    
    if (activeIndex < navItems.length - 1) {
      window.location.href = navItems[activeIndex + 1].getAttribute('href');
    }
  }

  handleSwipeRight() {
    // 向右滑动：上一页
    const navItems = Array.from(document.querySelectorAll('.mobile-nav-item'));
    const activeIndex = navItems.findIndex(item => item.classList.contains('active'));
    
    if (activeIndex > 0) {
      window.location.href = navItems[activeIndex - 1].getAttribute('href');
    }
  }

  showSwipeIndicator(direction) {
    let indicator = document.getElementById(`swipeIndicator-${direction}`);
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = `swipeIndicator-${direction}`;
      indicator.className = `swipe-indicator ${direction}`;
      indicator.textContent = direction === 'left' ? '← 上一页' : '下一页 →';
      document.body.appendChild(indicator);
    }

    indicator.classList.add('show');
  }

  hideSwipeIndicator() {
    document.querySelectorAll('.swipe-indicator').forEach(indicator => {
      indicator.classList.remove('show');
    });
  }

  // ========== 下拉刷新 ==========

  enablePullToRefresh() {
    let startY = 0;
    let isPulling = false;
    let pullIndicator = null;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 50) {
        this.showPullIndicator();
      }
    }, { passive: true });

    document.addEventListener('touchend', async (e) => {
      if (!isPulling) return;

      const currentY = e.changedTouches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 100) {
        await this.handlePullRefresh();
      }

      this.hidePullIndicator();
      isPulling = false;
    }, { passive: true });
  }

  showPullIndicator() {
    let indicator = document.getElementById('pullToRefresh');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pullToRefresh';
      indicator.className = 'pull-to-refresh';
      indicator.innerHTML = `
        <div class="pull-to-refresh-icon">🔄</div>
        <div>释放刷新</div>
      `;
      document.body.appendChild(indicator);
    }

    indicator.classList.add('show');
  }

  hidePullIndicator() {
    const indicator = document.getElementById('pullToRefresh');
    if (indicator) {
      indicator.classList.remove('show');
      setTimeout(() => indicator.remove(), 300);
    }
  }

  async handlePullRefresh() {
    const indicator = document.getElementById('pullToRefresh');
    if (indicator) {
      indicator.innerHTML = `
        <div class="pull-to-refresh-icon">🔄</div>
        <div>刷新中...</div>
      `;
    }

    // 触发刷新
    if (window.refreshManager) {
      const containers = document.querySelectorAll('[data-refreshable]');
      for (const container of containers) {
        await window.refreshManager.manualRefresh(container);
      }
    } else {
      // 如果没有刷新管理器，重新加载页面
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    }
  }

  // ========== 图表触摸优化 ==========

  optimizeChartTouch() {
    // 监听图表容器
    const observer = new MutationObserver(() => {
      const charts = document.querySelectorAll('canvas');
      charts.forEach(canvas => {
        if (!canvas.classList.contains('touch-optimized')) {
          canvas.classList.add('touch-optimized');
          
          // 禁用默认的触摸行为
          canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
          }, { passive: false });

          canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
          }, { passive: false });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ========== 震动反馈 ==========

  vibrate(pattern = [10]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

// 初始化移动端优化
let mobileOptimizer;
document.addEventListener('DOMContentLoaded', () => {
  mobileOptimizer = new MobileOptimizer();
});

// 导出为全局对象
window.mobileOptimizer = mobileOptimizer;
