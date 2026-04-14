// ========== 智能提醒系统 ==========

class SmartNotifier {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications_history') || '[]');
    this.enabled = JSON.parse(localStorage.getItem('notifications_enabled') || 'true');
    
    this.init();
  }

  init() {
    // 请求浏览器通知权限
    this.requestPermission();
    
    // 启动监控
    if (this.enabled) {
      this.startMonitoring();
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('通知权限被拒绝');
      }
    }
  }

  // ========== 价格预警提醒 ==========

  checkPriceAlerts() {
    const alerts = JSON.parse(localStorage.getItem('price_alerts') || '{}');
    const watchlist = JSON.parse(localStorage.getItem('watchlist_v2') || '[]');

    watchlist.forEach(async (item) => {
      const alert = alerts[item.code];
      if (!alert || alert.triggered) return;

      try {
        const data = await window.API_Integration.fetchStockQuote(item.code);
        
        // 检查是否触发预警
        if ((alert.target >= alert.currentPrice && data.price >= alert.target) ||
            (alert.target <= alert.currentPrice && data.price <= alert.target)) {
          
          this.sendNotification({
            title: '🔔 价格预警',
            body: `${data.name} 已达到目标价格 ¥${alert.target}\n当前价格: ¥${data.price.toFixed(2)}`,
            icon: '🔔',
            data: { type: 'price_alert', code: item.code }
          });

          // 标记为已触发
          alert.triggered = true;
          localStorage.setItem('price_alerts', JSON.stringify(alerts));
        }
      } catch (error) {
        console.error(`检查 ${item.code} 价格预警失败:`, error);
      }
    });
  }

  // ========== 涨跌幅提醒 ==========

  async checkChangeAlerts() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist_v2') || '[]');
    const threshold = 5; // 5% 涨跌幅阈值

    for (const item of watchlist) {
      try {
        const data = await window.API_Integration.fetchStockQuote(item.code);
        
        if (Math.abs(data.changePercent) >= threshold) {
          const direction = data.changePercent > 0 ? '上涨' : '下跌';
          const emoji = data.changePercent > 0 ? '📈' : '📉';
          
          this.sendNotification({
            title: `${emoji} 涨跌提醒`,
            body: `${data.name} ${direction} ${Math.abs(data.changePercent).toFixed(2)}%\n当前价格: ¥${data.price.toFixed(2)}`,
            icon: emoji,
            data: { type: 'change_alert', code: item.code }
          });
        }
      } catch (error) {
        console.error(`检查 ${item.code} 涨跌幅失败:`, error);
      }
    }
  }

  // ========== AI 推荐更新提醒 ==========

  checkAIRecommendations() {
    const lastCheck = localStorage.getItem('last_ai_check');
    const now = Date.now();

    // 每小时检查一次
    if (!lastCheck || now - parseInt(lastCheck) > 3600000) {
      this.sendNotification({
        title: '🤖 AI 推荐更新',
        body: '新的 AI 投资推荐已生成，点击查看',
        icon: '🤖',
        data: { type: 'ai_update', url: '/pages/ai/recommendations.html' }
      });

      localStorage.setItem('last_ai_check', now.toString());
    }
  }

  // ========== 发送通知 ==========

  sendNotification(options) {
    const { title, body, icon, data } = options;

    // 保存到历史
    this.notifications.unshift({
      title,
      body,
      icon,
      timestamp: new Date().toISOString(),
      data
    });

    // 限制历史记录数量
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    localStorage.setItem('notifications_history', JSON.stringify(this.notifications));

    // 发送浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data?.type || 'general',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        if (data?.url) {
          window.location.href = data.url;
        } else if (data?.code) {
          window.location.href = `/pages/stocks/detail.html?code=${data.code}`;
        }
        notification.close();
      };
    } else {
      // 使用页面内通知
      this.showInPageNotification(title, body, icon);
    }
  }

  showInPageNotification(title, body, icon) {
    const notification = document.createElement('div');
    notification.className = 'in-page-notification';
    notification.innerHTML = `
      <div class="in-page-notification-icon">${icon}</div>
      <div class="in-page-notification-content">
        <div class="in-page-notification-title">${title}</div>
        <div class="in-page-notification-body">${body}</div>
      </div>
      <button class="in-page-notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(notification);

    // 添加样式
    this.addInPageNotificationStyles();

    // 10秒后自动关闭
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 10000);
  }

  addInPageNotificationStyles() {
    if (document.getElementById('in-page-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'in-page-notification-styles';
    style.textContent = `
      .in-page-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(26, 26, 46, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        max-width: 350px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
      }

      .in-page-notification.fade-out {
        animation: fadeOut 0.3s ease;
        opacity: 0;
      }

      .in-page-notification-icon {
        font-size: 2rem;
      }

      .in-page-notification-content {
        flex: 1;
      }

      .in-page-notification-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
        font-size: 1rem;
      }

      .in-page-notification-body {
        font-size: 0.85rem;
        color: #ccc;
        line-height: 1.4;
        white-space: pre-line;
      }

      .in-page-notification-close {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 1;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @media (max-width: 768px) {
        .in-page-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ========== 提醒历史 ==========

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
    localStorage.removeItem('notifications_history');
  }

  // ========== 启动/停止监控 ==========

  startMonitoring() {
    // 每30秒检查一次价格预警
    this.priceAlertInterval = setInterval(() => {
      this.checkPriceAlerts();
    }, 30000);

    // 每5分钟检查一次涨跌幅
    this.changeAlertInterval = setInterval(() => {
      this.checkChangeAlerts();
    }, 300000);

    // 每小时检查一次 AI 推荐
    this.aiCheckInterval = setInterval(() => {
      this.checkAIRecommendations();
    }, 3600000);

    // 立即执行一次检查
    this.checkPriceAlerts();
  }

  stopMonitoring() {
    if (this.priceAlertInterval) clearInterval(this.priceAlertInterval);
    if (this.changeAlertInterval) clearInterval(this.changeAlertInterval);
    if (this.aiCheckInterval) clearInterval(this.aiCheckInterval);
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    localStorage.setItem('notifications_enabled', JSON.stringify(this.enabled));

    if (this.enabled) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }

    return this.enabled;
  }
}

// 初始化智能提醒
let smartNotifier;
document.addEventListener('DOMContentLoaded', () => {
  smartNotifier = new SmartNotifier();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (smartNotifier) {
    smartNotifier.stopMonitoring();
  }
});

// 导出为全局对象
window.smartNotifier = smartNotifier;
