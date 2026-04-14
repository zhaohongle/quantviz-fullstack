// ========== 用户设置管理 ==========

class SettingsManager {
  constructor() {
    // 默认设置
    this.defaultSettings = {
      theme: 'dark',
      fontSize: 'medium',
      autoRefresh: true,
      refreshInterval: 30,
      priceAlerts: true,
      aiNotifications: false,
      chartAnimation: true,
      performanceMode: false
    };

    // 加载用户设置
    this.settings = this.loadSettings();
    
    this.init();
  }

  init() {
    // 加载导航栏
    this.loadNavigation();
    
    // 应用当前设置
    this.applySettings();
    
    // 更新UI状态
    this.updateUI();
  }

  async loadNavigation() {
    const navDiv = document.getElementById('navigation');
    if (!navDiv) return;
    
    const response = await fetch('../../components/navigation.html');
    const html = await response.text();
    navDiv.innerHTML = html;
  }

  // 加载设置
  loadSettings() {
    const saved = localStorage.getItem('user_settings');
    if (saved) {
      try {
        return { ...this.defaultSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('加载设置失败:', error);
        return { ...this.defaultSettings };
      }
    }
    return { ...this.defaultSettings };
  }

  // 保存设置
  saveSettings() {
    localStorage.setItem('user_settings', JSON.stringify(this.settings));
    this.showSaveIndicator();
  }

  // 应用设置
  applySettings() {
    // 应用主题
    this.applyTheme(this.settings.theme);
    
    // 应用字体大小
    this.applyFontSize(this.settings.fontSize);
    
    // 应用性能模式
    if (this.settings.performanceMode) {
      document.body.classList.add('performance-mode');
    }
    
    // 应用刷新设置
    if (window.refreshManager) {
      window.refreshManager.refreshConfig.autoRefresh = this.settings.autoRefresh;
      window.refreshManager.refreshConfig.interval = this.settings.refreshInterval;
      
      if (this.settings.autoRefresh) {
        window.refreshManager.startAutoRefresh();
      }
    }
  }

  // 更新UI状态
  updateUI() {
    // 更新主题选择器
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.toggle('active', option.dataset.theme === this.settings.theme);
    });

    // 更新字体大小选择器
    document.querySelectorAll('.font-size-option').forEach(option => {
      option.classList.toggle('active', option.dataset.size === this.settings.fontSize);
    });

    // 更新刷新频率选择器
    document.querySelectorAll('.refresh-option').forEach(option => {
      const interval = parseInt(option.dataset.interval);
      option.classList.toggle('active', interval === this.settings.refreshInterval);
    });

    // 更新开关状态
    const toggles = [
      { selector: '.settings-section:nth-child(3) .toggle-switch', value: this.settings.autoRefresh },
      { selector: '.settings-section:nth-child(4) .toggle-switch:nth-of-type(1)', value: this.settings.priceAlerts },
      { selector: '.settings-section:nth-child(4) .toggle-switch:nth-of-type(2)', value: this.settings.aiNotifications },
      { selector: '.settings-section:nth-child(5) .toggle-switch:nth-of-type(1)', value: this.settings.chartAnimation },
      { selector: '.settings-section:nth-child(5) .toggle-switch:nth-of-type(2)', value: this.settings.performanceMode }
    ];

    toggles.forEach(({ selector, value }, index) => {
      const toggle = document.querySelectorAll('.toggle-switch')[index];
      if (toggle) {
        toggle.classList.toggle('active', value);
      }
    });
  }

  // ========== 主题设置 ==========
  setTheme(theme) {
    this.settings.theme = theme;
    this.applyTheme(theme);
    this.saveSettings();
    this.updateUI();
  }

  applyTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  // ========== 字体大小设置 ==========
  setFontSize(size) {
    this.settings.fontSize = size;
    this.applyFontSize(size);
    this.saveSettings();
    this.updateUI();
  }

  applyFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);

    // 添加字体大小样式
    if (!document.getElementById('font-size-styles')) {
      const style = document.createElement('style');
      style.id = 'font-size-styles';
      style.textContent = `
        .font-small {
          font-size: 14px;
        }
        .font-medium {
          font-size: 16px;
        }
        .font-large {
          font-size: 18px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ========== 刷新设置 ==========
  toggleAutoRefresh(toggleElement) {
    this.settings.autoRefresh = !this.settings.autoRefresh;
    toggleElement.classList.toggle('active', this.settings.autoRefresh);
    
    // 应用到 RefreshManager
    if (window.refreshManager) {
      window.refreshManager.toggleAutoRefresh();
    }
    
    this.saveSettings();
  }

  setRefreshInterval(seconds) {
    this.settings.refreshInterval = seconds;
    
    // 应用到 RefreshManager
    if (window.refreshManager) {
      window.refreshManager.setRefreshInterval(seconds);
    }
    
    this.saveSettings();
    this.updateUI();
  }

  // ========== 通知设置 ==========
  toggleNotifications(toggleElement) {
    this.settings.priceAlerts = !this.settings.priceAlerts;
    toggleElement.classList.toggle('active', this.settings.priceAlerts);
    
    // 请求浏览器通知权限
    if (this.settings.priceAlerts && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') {
            this.settings.priceAlerts = false;
            toggleElement.classList.remove('active');
            alert('浏览器通知权限被拒绝，无法启用价格预警通知');
          }
        });
      }
    }
    
    this.saveSettings();
  }

  toggleAINotifications(toggleElement) {
    this.settings.aiNotifications = !this.settings.aiNotifications;
    toggleElement.classList.toggle('active', this.settings.aiNotifications);
    
    // 请求浏览器通知权限
    if (this.settings.aiNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') {
            this.settings.aiNotifications = false;
            toggleElement.classList.remove('active');
            alert('浏览器通知权限被拒绝，无法启用 AI 推荐通知');
          }
        });
      }
    }
    
    this.saveSettings();
  }

  // ========== 高级设置 ==========
  toggleChartAnimation(toggleElement) {
    this.settings.chartAnimation = !this.settings.chartAnimation;
    toggleElement.classList.toggle('active', this.settings.chartAnimation);
    
    // 应用到图表
    if (window.echarts) {
      // 全局设置 ECharts 动画
      // 需要在每个图表初始化时检查此设置
    }
    
    this.saveSettings();
  }

  togglePerformanceMode(toggleElement) {
    this.settings.performanceMode = !this.settings.performanceMode;
    toggleElement.classList.toggle('active', this.settings.performanceMode);
    
    // 应用性能模式
    document.body.classList.toggle('performance-mode', this.settings.performanceMode);
    
    // 添加性能模式样式
    if (!document.getElementById('performance-mode-styles')) {
      const style = document.createElement('style');
      style.id = 'performance-mode-styles';
      style.textContent = `
        .performance-mode * {
          animation: none !important;
          transition: none !important;
        }
        .performance-mode canvas#particles {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
    
    this.saveSettings();
  }

  // ========== 重置设置 ==========
  resetToDefault() {
    if (!confirm('确定要恢复默认设置吗？所有个性化配置将被重置。')) {
      return;
    }

    // 重置为默认设置
    this.settings = { ...this.defaultSettings };
    
    // 保存并应用
    this.saveSettings();
    this.applySettings();
    this.updateUI();

    // 显示通知
    this.showNotification('✓ 已恢复默认设置', 'success');

    // 刷新页面以确保所有设置生效
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // ========== UI 辅助函数 ==========
  showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    indicator.classList.add('show');
    
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#34c759' : '#667eea'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }
}

// 初始化设置管理器
let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
  settingsManager = new SettingsManager();
});

// 导出为全局对象
window.settingsManager = settingsManager;
