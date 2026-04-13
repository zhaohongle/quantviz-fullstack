// ========== 新闻详情页 API 集成脚本 ==========

// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get('id') || '1';

// ========== 加载新闻详情 ==========
async function loadNewsDetail() {
    try {
        showLoading('article-content', true);
        
        // 获取新闻数据
        const newsData = await fetchNews();
        
        // 模拟根据 ID 查找新闻（实际应该有 /api/news/:id 端点）
        const newsItem = newsData[parseInt(newsId) - 1] || newsData[0];
        
        if (!newsItem) {
            showError('article-content', '未找到新闻');
            return;
        }
        
        // 渲染新闻内容
        renderNewsHeader(newsItem);
        renderNewsContent(newsItem);
        renderRelatedStocks();
        renderRelatedNews();
        
    } catch (error) {
        console.error('❌ 加载新闻详情失败:', error);
        showError('article-content', '加载失败，请稍后重试');
    }
}

// ========== 渲染新闻头部 ==========
function renderNewsHeader(news) {
    const titleEl = document.querySelector('.article-title');
    const metaEl = document.querySelector('.article-meta');
    const tagsEl = document.querySelector('.article-tags');
    
    if (titleEl) {
        titleEl.textContent = news.title || '沪指大涨1.46%,半导体板块领涨,科创板成交额创新高';
    }
    
    if (metaEl) {
        const timestamp = news.time || '16:14';
        const source = news.source || '新浪财经';
        const views = Math.floor(Math.random() * 50000 + 10000);
        
        metaEl.innerHTML = `
            <div class="meta-item">
                <span class="meta-icon">🕐</span>
                <span>${new Date().toISOString().split('T')[0]} ${timestamp}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">📰</span>
                <span>${source}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">👁</span>
                <span>${views.toLocaleString()} 阅读</span>
            </div>
        `;
    }
    
    if (tagsEl && news.tags) {
        tagsEl.innerHTML = news.tags.map(tag => 
            `<span class="tag">#${tag}</span>`
        ).join('');
    }
}

// ========== 渲染新闻内容（使用模拟数据） ==========
function renderNewsContent(news) {
    const contentEl = document.querySelector('.article-content');
    if (!contentEl) return;
    
    // 实际项目中应该从 API 获取完整的新闻内容
    // 这里保留默认的静态内容，只更新摘要部分
    const summary = news.summary || '科创50暴涨3.33%,市场情绪高涨,北向资金净流入超80亿元...';
    
    const firstP = contentEl.querySelector('p');
    if (firstP) {
        firstP.innerHTML = `<strong>【摘要】</strong>${summary}`;
    }
}

// ========== 渲染相关股票 ==========
async function renderRelatedStocks() {
    const container = document.querySelector('.related-stocks-grid');
    if (!container) return;
    
    try {
        const stocks = await fetchStocks();
        const relatedStocks = stocks.slice(0, 6); // 取前 6 只股票
        
        if (relatedStocks.length === 0) {
            // 使用模拟数据
            container.innerHTML = generateMockStockCards();
            return;
        }
        
        container.innerHTML = relatedStocks.map(stock => `
            <div class="stock-card">
                <div class="stock-card-header">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-code">${stock.code}</div>
                </div>
                <div class="stock-price">${formatPrice(stock.price || 0)}</div>
                <div class="stock-change ${stock.changePercent > 0 ? 'up' : 'down'}">
                    ${stock.changePercent > 0 ? '+' : ''}${(stock.changePercent || 0).toFixed(2)}%
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ 加载相关股票失败:', error);
        container.innerHTML = generateMockStockCards();
    }
}

// ========== 生成模拟股票卡片 ==========
function generateMockStockCards() {
    const mockStocks = [
        { name: '北方华创', code: '002371', price: 312.45, change: 10.00 },
        { name: '中芯国际', code: '688981', price: 45.88, change: 8.52 },
        { name: '宁德时代', code: '300750', price: 188.77, change: 5.82 },
        { name: '比亚迪', code: '002594', price: 256.33, change: 4.15 },
        { name: '药明康德', code: '603259', price: 103.81, change: 5.82 },
        { name: '海康威视', code: '002415', price: 45.23, change: 3.67 }
    ];
    
    return mockStocks.map(stock => `
        <div class="stock-card">
            <div class="stock-card-header">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-code">${stock.code}</div>
            </div>
            <div class="stock-price">${formatPrice(stock.price)}</div>
            <div class="stock-change up">+${stock.change.toFixed(2)}%</div>
        </div>
    `).join('');
}

// ========== 渲染相关新闻 ==========
async function renderRelatedNews() {
    const container = document.querySelector('.related-news-list');
    if (!container) return;
    
    try {
        const newsData = await fetchNews();
        const relatedNews = newsData.slice(0, 5); // 取前 5 条
        
        if (relatedNews.length === 0) {
            container.innerHTML = generateMockNewsList();
            return;
        }
        
        container.innerHTML = relatedNews.map(item => `
            <div class="related-news-item" onclick="window.location.href='news-detail.html?id=${item.id || 1}'">
                <div class="related-news-meta">${item.time || '16:00'} · ${item.source || '新浪财经'}</div>
                <div class="related-news-title">${item.title}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ 加载相关新闻失败:', error);
        container.innerHTML = generateMockNewsList();
    }
}

// ========== 生成模拟新闻列表 ==========
function generateMockNewsList() {
    const mockNews = [
        { time: '15:30', source: '东方财富', title: '北方华创盘中创新高,成交额超15亿元,机构买入明显' },
        { time: '15:00', source: '华尔街见闻', title: '美联储官员暗示今年或加息两次,科技股承压' },
        { time: '14:20', source: '新浪财经', title: '新能源汽车板块午后拉升,宁德时代涨超5%' },
        { time: '13:45', source: '东方财富', title: '中央经济工作会议定调2026年政策,稳增长信号明确' },
        { time: '12:30', source: '华尔街见闻', title: '比特币突破40000美元,加密货币市场全线上涨' }
    ];
    
    return mockNews.map((item, idx) => `
        <div class="related-news-item" onclick="window.location.href='news-detail.html?id=${idx + 2}'">
            <div class="related-news-meta">${item.time} · ${item.source}</div>
            <div class="related-news-title">${item.title}</div>
        </div>
    `).join('');
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadNewsDetail();
    
    // 添加分享功能（可选）
    const shareBtn = document.querySelector('.btn-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                // 复制链接到剪贴板
                navigator.clipboard.writeText(window.location.href);
                alert('链接已复制到剪贴板');
            }
        });
    }
});
