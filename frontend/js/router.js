// ========== 频道配置 ==========
const channels = {
    'home': {
        title: '首页',
        url: 'pages/home-redesign.html',
        breadcrumb: ['首页']
    },
    'ai-recommendations': {
        title: 'AI推荐',
        url: 'pages/prd3/recommendations-new.html',
        breadcrumb: ['首页', 'AI推荐']
    },
    'smart-filter': {
        title: '智能筛选',
        url: 'pages/filter/smart-filter.html',
        breadcrumb: ['首页', '智能筛选']
    },
    'market-data': {
        title: '市场数据',
        url: 'pages/stocks/kline.html',
        breadcrumb: ['首页', '市场数据']
    },
    'watchlist': {
        title: '自选股',
        url: 'pages/watchlist/index.html',
        breadcrumb: ['首页', '自选股']
    },
    'settings': {
        title: '设置',
        url: 'pages/settings/index.html',
        breadcrumb: ['首页', '设置']
    }
};

// ========== 路由管理器 ==========
class Router {
    constructor() {
        this.currentChannel = null;
        this.contentCache = new Map();
        this.maxCacheSize = 5;
    }

    /**
     * 导航到指定频道
     */
    async navigate(channel) {
        const config = channels[channel];
        
        if (!config) {
            this.showError(`未找到频道: ${channel}`);
            return;
        }

        // 避免重复加载
        if (this.currentChannel === channel) {
            return;
        }

        try {
            // 显示加载状态
            this.showLoading();

            // 尝试从缓存加载
            let content = this.contentCache.get(channel);
            
            if (!content) {
                // 从服务器加载
                const response = await fetch(config.url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const html = await response.text();
                content = this.extractMainContent(html);
                
                // 缓存内容
                this.cacheContent(channel, content);
            }

            // 更新内容区
            this.updateContent(content);

            // 更新面包屑
            this.updateBreadcrumb(config.breadcrumb);

            // 更新导航激活状态
            this.updateActiveNav(channel);

            // 更新页面标题
            document.title = `${config.title} - 量子财富智能交易平台`;

            // 记录当前频道
            this.currentChannel = channel;

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 隐藏加载状态
            this.hideLoading();

        } catch (error) {
            console.error('频道加载失败:', error);
            this.showError(`加载失败: ${error.message}`);
            this.hideLoading();
        }
    }

    /**
     * 提取页面主内容（移除导航栏等）
     */
    extractMainContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 移除原页面可能存在的导航栏
        const selectors = [
            '.navbar',
            'nav.navbar',
            '.top-nav',
            'header',
            '.breadcrumb'
        ];

        selectors.forEach(selector => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // 提取主要内容
        const main = doc.querySelector('main') || 
                     doc.querySelector('.container') || 
                     doc.querySelector('.content') ||
                     doc.body;

        // 返回内部HTML（保留样式和脚本）
        return main.innerHTML;
    }

    /**
     * 更新内容区
     */
    updateContent(content) {
        const contentEl = document.getElementById('content');
        
        if (!contentEl) {
            console.error('未找到内容容器 #content');
            return;
        }

        // 淡出效果
        contentEl.style.opacity = '0';
        
        setTimeout(() => {
            contentEl.innerHTML = content;
            
            // 执行新内容中的脚本
            this.executeScripts(contentEl);
            
            // 淡入效果
            contentEl.style.opacity = '1';
        }, 150);
    }

    /**
     * 执行内容中的脚本
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // 复制属性
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // 复制内容
            newScript.textContent = oldScript.textContent;
            
            // 替换旧脚本
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    /**
     * 更新面包屑导航
     */
    updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumbContainer');
        
        if (!breadcrumb) {
            console.error('未找到面包屑容器 #breadcrumbContainer');
            return;
        }

        const html = items.map((item, index) => {
            // 最后一项（当前页面）不可点击
            if (index === items.length - 1) {
                return `<span class="breadcrumb-item active">${item}</span>`;
            }
            
            // 其他项可点击返回首页
            return `
                <a class="breadcrumb-item" onclick="router.navigate('home')">${item}</a>
                <span class="breadcrumb-separator">›</span>
            `;
        }).join('');

        breadcrumb.innerHTML = html;
    }

    /**
     * 更新导航激活状态
     */
    updateActiveNav(channel) {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (item.dataset.channel === channel) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 缓存内容
     */
    cacheContent(channel, content) {
        // 限制缓存大小
        if (this.contentCache.size >= this.maxCacheSize) {
            const firstKey = this.contentCache.keys().next().value;
            this.contentCache.delete(firstKey);
        }
        
        this.contentCache.set(channel, content);
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            // 延迟隐藏，确保内容已渲染
            setTimeout(() => {
                overlay.classList.remove('show');
            }, 300);
        }
    }

    /**
     * 显示错误提示
     */
    showError(message) {
        const toast = document.getElementById('errorToast');
        
        if (!toast) {
            console.error('未找到错误提示容器 #errorToast');
            return;
        }

        toast.textContent = message;
        toast.classList.add('show');

        // 3秒后自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.contentCache.clear();
        console.log('缓存已清除');
    }

    /**
     * 获取当前频道
     */
    getCurrentChannel() {
        return this.currentChannel;
    }
}

// ========== 创建全局路由实例 ==========
const router = new Router();

// ========== 浏览器前进/后退支持 ==========
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.channel) {
        router.navigate(event.state.channel);
    }
});

// 监听路由变化（支持 URL hash）
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1); // 移除 #
    if (hash && channels[hash]) {
        router.navigate(hash);
    }
});

// ========== 导出（供其他脚本使用）==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Router, router, channels };
}
