// ========== QuantViz 错误处理工具 ==========
// 统一的错误处理、重试机制和友好提示

const ErrorHandler = {
    // 配置项
    config: {
        maxRetries: 3,
        retryDelays: [1000, 2000, 4000], // 递增间隔（ms）
        isDevelopment: window.location.hostname === 'localhost',
        logErrors: true
    },

    // ========== 网络错误处理与自动重试 ==========
    
    /**
     * 带重试的 API 请求
     * @param {Function} requestFn - 返回 Promise 的请求函数
     * @param {Object} options - 配置选项
     * @returns {Promise<any>}
     */
    async retryRequest(requestFn, options = {}) {
        const maxRetries = options.maxRetries || this.config.maxRetries;
        const onRetry = options.onRetry || (() => {});
        
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                
                // 成功后清除重试提示
                if (attempt > 0) {
                    this.hideRetryNotification();
                }
                
                return result;
            } catch (error) {
                lastError = error;
                
                // 如果还有重试机会
                if (attempt < maxRetries) {
                    const delay = this.config.retryDelays[attempt] || 4000;
                    
                    this.log('warn', `API请求失败，${delay}ms 后重试（${attempt + 1}/${maxRetries}）`, error);
                    
                    // 显示重试提示
                    this.showRetryNotification(attempt + 1, maxRetries);
                    
                    // 回调通知
                    onRetry(attempt + 1, maxRetries);
                    
                    // 等待后重试
                    await this.delay(delay);
                } else {
                    this.log('error', 'API请求失败，已达最大重试次数', error);
                }
            }
        }
        
        // 所有重试都失败
        throw lastError;
    },

    /**
     * 显示重试提示
     */
    showRetryNotification(current, max) {
        let notification = document.getElementById('retry-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'retry-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            `;
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">⏳</div>
                <div>
                    <div style="font-weight: 600; color: #92400E; margin-bottom: 4px;">
                        网络请求失败
                    </div>
                    <div style="font-size: 14px; color: #78350F;">
                        正在重试 ${current}/${max}...
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 隐藏重试提示
     */
    hideRetryNotification() {
        const notification = document.getElementById('retry-notification');
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    },

    // ========== 友好错误提示 ==========
    
    /**
     * 显示错误提示
     * @param {Error} error - 错误对象
     * @param {Object} options - 配置选项
     */
    showError(error, options = {}) {
        const {
            title = '操作失败',
            message = this.getErrorMessage(error),
            type = 'error', // error | warning | info
            duration = 5000,
            showDetails = this.config.isDevelopment
        } = options;

        this.showNotification({
            title,
            message,
            type,
            duration,
            details: showDetails ? error.stack || error.message : null
        });
    },

    /**
     * 显示通知
     */
    showNotification({ title, message, type, duration, details }) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };

        const colors = {
            error: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' },
            warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
            info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
            success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' }
        };

        const style = colors[type] || colors.error;

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${style.bg};
            border: 2px solid ${style.border};
            border-radius: 8px;
            padding: 16px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 24px; flex-shrink: 0;">${icons[type]}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: ${style.text}; margin-bottom: 4px;">
                        ${title}
                    </div>
                    <div style="font-size: 14px; color: ${style.text}; opacity: 0.9;">
                        ${message}
                    </div>
                    ${details ? `
                        <details style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
                            <summary style="cursor: pointer; color: ${style.text};">
                                查看详情
                            </summary>
                            <pre style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${details}</pre>
                        </details>
                    ` : ''}
                </div>
                <button onclick="this.closest('.error-notification').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: ${style.text}; padding: 0; line-height: 1;">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    },

    /**
     * 获取友好的错误消息
     */
    getErrorMessage(error) {
        if (!error) return '发生未知错误';

        const message = error.message || String(error);

        // 网络错误
        if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
            return '网络连接失败，请检查网络后重试';
        }

        // HTTP 错误
        if (message.includes('HTTP')) {
            const match = message.match(/HTTP\s+(\d+)/);
            if (match) {
                const status = parseInt(match[1]);
                if (status === 404) return '请求的资源不存在';
                if (status === 403) return '没有访问权限';
                if (status === 500) return '服务器错误，请稍后重试';
                if (status >= 500) return '服务器错误';
                if (status >= 400) return '请求错误';
            }
        }

        // 超时错误
        if (message.includes('timeout')) {
            return '请求超时，请重试';
        }

        // JSON 解析错误
        if (message.includes('JSON')) {
            return '数据格式错误';
        }

        // 返回原始消息（开发模式）或通用消息（生产模式）
        return this.config.isDevelopment ? message : '操作失败，请重试';
    },

    // ========== 全局错误捕获 ==========
    
    /**
     * 初始化全局错误监听
     */
    initGlobalErrorHandler() {
        // 捕获未处理的 Promise 错误
        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            this.log('error', 'Unhandled Promise Rejection', event.reason);
            this.showError(event.reason, {
                title: '系统错误',
                message: '发生未预期的错误，我们已记录并将尽快修复'
            });
        });

        // 捕获 JS 运行时错误
        window.addEventListener('error', (event) => {
            // 忽略资源加载错误（图片、脚本等）
            if (event.target !== window) {
                return;
            }

            event.preventDefault();
            this.log('error', 'Runtime Error', event.error);
            this.showError(event.error, {
                title: '程序错误',
                message: '页面运行出错，请刷新重试'
            });
        });

        this.log('info', '全局错误处理器已初始化');
    },

    // ========== 工具函数 ==========
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 日志输出
     */
    log(level, message, data = null) {
        if (!this.config.logErrors) return;

        const prefix = `[ErrorHandler]`;
        const styles = {
            error: 'color: #DC2626; font-weight: bold;',
            warn: 'color: #F59E0B; font-weight: bold;',
            info: 'color: #3B82F6;'
        };

        if (data) {
            console[level](prefix, message, data);
        } else {
            console[level](prefix, message);
        }
    }
};

// ========== 增强 API 集成模块 ==========

/**
 * 增强版 API 请求（带自动重试）
 */
async function enhancedApiRequest(endpoint, fallbackData = null, options = {}) {
    const requestFn = async () => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data || result;
    };

    try {
        return await ErrorHandler.retryRequest(requestFn, options);
    } catch (error) {
        ErrorHandler.log('error', `API请求最终失败 [${endpoint}]`, error);
        
        if (fallbackData) {
            ErrorHandler.showNotification({
                title: '数据加载失败',
                message: '已切换到演示数据模式',
                type: 'warning',
                duration: 3000
            });
            return fallbackData;
        }
        
        ErrorHandler.showError(error, {
            title: 'API 请求失败',
            message: '无法加载数据，请刷新页面重试'
        });
        
        throw error;
    }
}

// ========== CSS 动画（自动注入） ==========

if (!document.getElementById('error-handler-styles')) {
    const style = document.createElement('style');
    style.id = 'error-handler-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== 自动初始化 ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ErrorHandler.initGlobalErrorHandler();
    });
} else {
    ErrorHandler.initGlobalErrorHandler();
}

// ========== 导出 ==========
window.ErrorHandler = ErrorHandler;
window.enhancedApiRequest = enhancedApiRequest;
