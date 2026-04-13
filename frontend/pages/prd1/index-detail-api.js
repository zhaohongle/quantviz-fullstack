// ========== 指数详情页 API 集成脚本 ==========

// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const indexId = urlParams.get('id') || '000001';

// ========== 加载指数详情 ==========
async function loadIndexDetail() {
    try {
        showLoading('index-stats-container', true);
        
        // 获取指数数据
        const indices = await fetchIndices();
        const indexData = indices.find(idx => idx.code === indexId);
        
        if (!indexData) {
            showError('index-stats-container', '未找到指数数据');
            return;
        }
        
        // 渲染头部信息
        renderIndexHeader(indexData);
        
        // 渲染统计数据
        renderIndexStats(indexData);
        
        // 加载 K 线图（模拟）
        renderChart();
        
        // 加载技术指标
        renderIndicators();
        
        // 加载历史数据
        renderHistory();
        
    } catch (error) {
        console.error('❌ 加载指数详情失败:', error);
        showError('index-stats-container', '加载失败，请稍后重试');
    }
}

// ========== 渲染头部信息 ==========
function renderIndexHeader(data) {
    const titleEl = document.querySelector('.index-title');
    const codeEl = document.querySelector('.index-code');
    const breadcrumbEl = document.querySelector('.breadcrumb');
    
    if (titleEl) titleEl.textContent = data.name;
    if (codeEl) codeEl.textContent = `${data.code} · ${getMarketName(data.code)}`;
    if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `
            <a href="../../index-new.html">首页</a> / 
            <a href="indices.html">全球指数</a> / 
            ${data.name}
        `;
    }
}

// ========== 渲染统计数据 ==========
function renderIndexStats(data) {
    const statsContainer = document.querySelector('.index-stats');
    if (!statsContainer) return;
    
    const changeInfo = formatChange(data.changePercent || 0);
    const changeAmount = data.change || 0;
    const open = data.price - changeAmount * 0.5;
    const high = data.price + changeAmount * 0.3;
    const low = data.price - changeAmount * 0.8;
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">最新价</div>
            <div class="stat-value">${formatPrice(data.price)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">涨跌额</div>
            <div class="stat-value ${changeInfo.class}">${changeAmount > 0 ? '+' : ''}${formatPrice(changeAmount)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">涨跌幅</div>
            <div class="stat-value ${changeInfo.class}">${changeInfo.text} ${changeInfo.arrow}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">今开</div>
            <div class="stat-value">${formatPrice(open)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">昨收</div>
            <div class="stat-value">${formatPrice(data.price - changeAmount)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">最高</div>
            <div class="stat-value">${formatPrice(high)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">最低</div>
            <div class="stat-value">${formatPrice(low)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">成交量</div>
            <div class="stat-value">${(Math.random() * 500 + 200).toFixed(1)} 亿股</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">成交额</div>
            <div class="stat-value">${(Math.random() * 6000 + 3000).toFixed(0)} 亿元</div>
        </div>
    `;
}

// ========== 渲染 K 线图（占位） ==========
function renderChart() {
    const placeholder = document.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div style="text-align: center; color: #9CA3AF;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div>K 线图区域（建议使用 ECharts 集成）</div>
                <div style="font-size: 12px; margin-top: 8px;">实际项目中集成 ECharts 或 TradingView</div>
            </div>
        `;
    }
}

// ========== 渲染技术指标 ==========
function renderIndicators() {
    const grid = document.querySelector('.indicators-grid');
    if (!grid) return;
    
    const indicators = [
        { name: 'MACD', value: 'DIF: 12.35', signal: 'buy', text: '金叉 ↑ 买入信号' },
        { name: 'KDJ', value: 'K: 65.2, D: 58.3', signal: 'buy', text: '金叉 ↑ 买入信号' },
        { name: 'RSI (14)', value: '62.5', signal: 'neutral', text: '中性' },
        { name: 'BOLL', value: '上轨: 4,012', signal: 'neutral', text: '中轨运行' },
        { name: 'MA5', value: '3,925.45', signal: 'buy', text: '价格 > MA5' },
        { name: 'MA10', value: '3,908.72', signal: 'buy', text: '价格 > MA10' },
        { name: 'MA20', value: '3,882.38', signal: 'buy', text: '价格 > MA20' },
        { name: '成交量 MA5', value: '315.2 亿股', signal: 'buy', text: '量能放大' }
    ];
    
    grid.innerHTML = indicators.map(ind => `
        <div class="indicator-card">
            <div class="indicator-name">${ind.name}</div>
            <div class="indicator-value">${ind.value}</div>
            <div class="indicator-signal ${ind.signal}">${ind.text}</div>
        </div>
    `).join('');
}

// ========== 渲染历史数据 ==========
function renderHistory() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    // 生成模拟历史数据（最近 10 天）
    const rows = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const close = 3900 + Math.random() * 100;
        const change = (Math.random() - 0.5) * 100;
        const changePercent = (change / close) * 100;
        const open = close - change * 0.5;
        const high = Math.max(close, open) + Math.random() * 30;
        const low = Math.min(close, open) - Math.random() * 30;
        const volume = (Math.random() * 200 + 250).toFixed(1);
        const amount = (Math.random() * 2000 + 3000).toFixed(0);
        
        const changeColor = change > 0 ? '#EF4444' : '#10B981';
        
        rows.push(`
            <tr>
                <td>${dateStr}</td>
                <td class="table-number">${formatPrice(close)}</td>
                <td class="table-number" style="color: ${changeColor};">${change > 0 ? '+' : ''}${formatPrice(change)}</td>
                <td class="table-number" style="color: ${changeColor};">${change > 0 ? '+' : ''}${changePercent.toFixed(2)}%</td>
                <td class="table-number">${formatPrice(open)}</td>
                <td class="table-number">${formatPrice(high)}</td>
                <td class="table-number">${formatPrice(low)}</td>
                <td class="table-number">${volume}</td>
                <td class="table-number">${amount}</td>
            </tr>
        `);
    }
    
    tbody.innerHTML = rows.join('');
}

// ========== 辅助函数 ==========
function getMarketName(code) {
    if (code.startsWith('000') || code.startsWith('6')) return '上海证券交易所';
    if (code.startsWith('399') || code.startsWith('3')) return '深圳证券交易所';
    if (code.startsWith('^')) return '美国股市';
    return '国际市场';
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadIndexDetail();
    
    // 监听时间周期按钮
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});
