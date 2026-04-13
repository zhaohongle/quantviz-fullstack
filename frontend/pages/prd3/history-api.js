// ========== AI 历史推荐记录页 API 集成脚本 ==========

let currentFilter = 'all'; // all, success, fail, pending
let currentSort = 'time'; // time, return, score

// ========== 加载历史记录 ==========
async function loadHistory() {
    try {
        showLoading('history-container', true);
        
        // 尝试从API获取历史数据
        const response = await fetch('http://localhost:3001/api/recommendations/history').catch(() => null);
        
        let historyData;
        if (response && response.ok) {
            const result = await response.json();
            historyData = result.data || result;
        } else {
            historyData = generateMockHistory();
        }
        
        // 应用筛选和排序
        historyData = filterAndSort(historyData);
        
        renderHistory(historyData);
        renderSummary(historyData);
        
    } catch (error) {
        console.error('❌ 加载历史记录失败:', error);
        const mockData = generateMockHistory();
        renderHistory(mockData);
        renderSummary(mockData);
    }
}

// ========== 渲染历史记录 ==========
function renderHistory(data) {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:60px;">暂无历史记录</div>';
        return;
    }
    
    container.innerHTML = data.map(record => {
        const status = record.status || 'completed';
        const actualReturn = record.actualReturn || 0;
        const returnClass = actualReturn > 0 ? 'up' : actualReturn < 0 ? 'down' : 'flat';
        
        let statusBadge = '';
        if (status === 'success') {
            statusBadge = '<span class="status-badge success">✓ 成功</span>';
        } else if (status === 'fail') {
            statusBadge = '<span class="status-badge fail">✗ 失败</span>';
        } else if (status === 'pending') {
            statusBadge = '<span class="status-badge pending">⏳ 进行中</span>';
        } else {
            statusBadge = '<span class="status-badge">已完成</span>';
        }
        
        return `
            <div class="history-card">
                <div class="history-header">
                    <div class="history-stock">
                        <div class="stock-name">${record.stockName || '--'}</div>
                        <div class="stock-code">${record.stockCode || '--'}</div>
                    </div>
                    ${statusBadge}
                </div>
                
                <div class="history-metrics">
                    <div class="metric-item">
                        <div class="metric-label">推荐时间</div>
                        <div class="metric-value">${record.recommendTime || '--'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">推荐价</div>
                        <div class="metric-value">${formatPrice(record.recommendPrice || 0)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">目标价</div>
                        <div class="metric-value">${formatPrice(record.targetPrice || 0)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">当前价</div>
                        <div class="metric-value">${formatPrice(record.currentPrice || 0)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">预期收益</div>
                        <div class="metric-value">${record.expectedReturn > 0 ? '+' : ''}${(record.expectedReturn || 0).toFixed(1)}%</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">实际收益</div>
                        <div class="metric-value ${returnClass}">
                            ${actualReturn > 0 ? '+' : ''}${actualReturn.toFixed(1)}%
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">推荐评分</div>
                        <div class="metric-value">${record.score || 0} 分</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">持有天数</div>
                        <div class="metric-value">${record.holdDays || 0} 天</div>
                    </div>
                </div>
                
                <div class="history-footer">
                    <button class="btn-detail" onclick="window.location.href='detail.html?id=${record.id}'">
                        查看详情
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========== 渲染统计摘要 ==========
function renderSummary(data) {
    const container = document.querySelector('.summary-stats');
    if (!container) return;
    
    const total = data.length;
    const success = data.filter(r => r.status === 'success').length;
    const fail = data.filter(r => r.status === 'fail').length;
    const pending = data.filter(r => r.status === 'pending').length;
    const accuracy = total > 0 ? (success / (success + fail)) * 100 : 0;
    const avgReturn = data.reduce((sum, r) => sum + (r.actualReturn || 0), 0) / (total || 1);
    
    container.innerHTML = `
        <div class="summary-item">
            <div class="summary-label">总推荐数</div>
            <div class="summary-value">${total}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">成功</div>
            <div class="summary-value" style="color: #EF4444;">${success}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">失败</div>
            <div class="summary-value" style="color: #10B981;">${fail}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">进行中</div>
            <div class="summary-value" style="color: #F59E0B;">${pending}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">准确率</div>
            <div class="summary-value">${accuracy.toFixed(1)}%</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">平均收益</div>
            <div class="summary-value ${avgReturn > 0 ? 'up' : 'down'}">
                ${avgReturn > 0 ? '+' : ''}${avgReturn.toFixed(1)}%
            </div>
        </div>
    `;
}

// ========== 筛选和排序 ==========
function filterAndSort(data) {
    // 筛选
    let filtered = data;
    if (currentFilter !== 'all') {
        filtered = data.filter(r => r.status === currentFilter);
    }
    
    // 排序
    filtered.sort((a, b) => {
        if (currentSort === 'time') {
            return new Date(b.recommendTime) - new Date(a.recommendTime);
        } else if (currentSort === 'return') {
            return (b.actualReturn || 0) - (a.actualReturn || 0);
        } else if (currentSort === 'score') {
            return (b.score || 0) - (a.score || 0);
        }
        return 0;
    });
    
    return filtered;
}

// ========== 生成模拟历史数据 ==========
function generateMockHistory() {
    const mockStocks = [
        { name: '北方华创', code: '002371', price: 312.45 },
        { name: '药明康德', code: '603259', price: 103.81 },
        { name: '宁德时代', code: '300750', price: 188.77 },
        { name: '海康威视', code: '002415', price: 45.23 },
        { name: '中芯国际', code: '688981', price: 45.88 }
    ];
    
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
        const stock = mockStocks[i % mockStocks.length];
        const daysAgo = Math.floor(Math.random() * 90 + 1);
        const recDate = new Date(today);
        recDate.setDate(recDate.getDate() - daysAgo);
        
        const recommendPrice = stock.price * (0.85 + Math.random() * 0.2);
        const expectedReturn = Math.random() * 15 + 5;
        const targetPrice = recommendPrice * (1 + expectedReturn / 100);
        const actualReturn = (Math.random() - 0.3) * 20;
        const currentPrice = recommendPrice * (1 + actualReturn / 100);
        
        let status = 'completed';
        if (actualReturn >= expectedReturn * 0.7) {
            status = 'success';
        } else if (actualReturn < 0) {
            status = 'fail';
        } else if (daysAgo < 7) {
            status = 'pending';
        }
        
        history.push({
            id: i + 1,
            stockName: stock.name,
            stockCode: stock.code,
            recommendTime: recDate.toISOString().split('T')[0],
            recommendPrice: recommendPrice,
            targetPrice: targetPrice,
            currentPrice: status === 'pending' ? stock.price : currentPrice,
            expectedReturn: expectedReturn,
            actualReturn: status === 'pending' ? ((stock.price - recommendPrice) / recommendPrice) * 100 : actualReturn,
            score: Math.floor(Math.random() * 20 + 75),
            holdDays: daysAgo,
            status: status
        });
    }
    
    return history;
}

// ========== 切换筛选 ==========
function switchFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(getFilterText(filter))) {
            btn.classList.add('active');
        }
    });
    
    loadHistory();
}

function getFilterText(filter) {
    const map = {
        'all': '全部',
        'success': '成功',
        'fail': '失败',
        'pending': '进行中'
    };
    return map[filter] || '全部';
}

// ========== 切换排序 ==========
function switchSort(sort) {
    currentSort = sort;
    loadHistory();
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    
    // 绑定筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.textContent;
            if (text.includes('全部')) switchFilter('all');
            else if (text.includes('成功')) switchFilter('success');
            else if (text.includes('失败')) switchFilter('fail');
            else if (text.includes('进行中')) switchFilter('pending');
        });
    });
    
    // 绑定排序选择器
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            switchSort(e.target.value);
        });
    }
});
