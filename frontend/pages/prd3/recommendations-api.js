// ========== AI 推荐列表页 API 集成脚本 ==========

// ========== 加载推荐数据 ==========
async function loadRecommendations() {
    try {
        showLoading('recommendations-container', true);
        
        // 获取推荐数据
        const recommendations = await fetchRecommendations();
        
        if (!recommendations || recommendations.length === 0) {
            const mockData = generateMockRecommendations();
            renderRecommendations(mockData);
            return;
        }
        
        renderRecommendations(recommendations);
        
    } catch (error) {
        console.error('❌ 加载推荐数据失败:', error);
        const mockData = generateMockRecommendations();
        renderRecommendations(mockData);
    }
}

// ========== 渲染推荐列表 ==========
function renderRecommendations(data) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:60px;">暂无推荐</div>';
        return;
    }
    
    container.innerHTML = data.map((rec, index) => {
        const scoreColor = rec.score >= 85 ? '#EF4444' : rec.score >= 70 ? '#F59E0B' : '#6B7280';
        const expectedReturn = rec.expectedReturn || 0;
        const returnClass = expectedReturn > 0 ? 'up' : expectedReturn < 0 ? 'down' : 'flat';
        const confidence = rec.confidence || '高';
        const strategy = rec.strategy || '短线';
        const reason = rec.reason || 'AI 综合分析显示该股票具有较好的投资价值';
        
        return `
            <div class="recommendation-card" onclick="window.location.href='detail.html?id=${rec.id || index + 1}'">
                <div class="rec-header">
                    <div class="rec-stock-info">
                        <div class="rec-stock-name">${rec.stockName || '--'}</div>
                        <div class="rec-stock-code">${rec.stockCode || '--'}</div>
                    </div>
                    <div class="rec-score" style="background: ${scoreColor};">
                        ${rec.score || 0} 分
                    </div>
                </div>
                
                <div class="rec-metrics">
                    <div class="rec-metric">
                        <div class="metric-label">预期收益</div>
                        <div class="metric-value ${returnClass}">
                            ${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(1)}%
                        </div>
                    </div>
                    <div class="rec-metric">
                        <div class="metric-label">置信度</div>
                        <div class="metric-value">${confidence}</div>
                    </div>
                    <div class="rec-metric">
                        <div class="metric-label">投资策略</div>
                        <div class="metric-value">${strategy}</div>
                    </div>
                    <div class="rec-metric">
                        <div class="metric-label">目标价位</div>
                        <div class="metric-value">${formatPrice(rec.targetPrice || 0)}</div>
                    </div>
                </div>
                
                <div class="rec-reason">
                    <div class="reason-label">🤖 AI 推荐理由：</div>
                    <div class="reason-text">${reason}</div>
                </div>
                
                <div class="rec-tags">
                    ${(rec.tags || ['技术面良好', '基本面稳健']).map(tag => 
                        `<span class="rec-tag">${tag}</span>`
                    ).join('')}
                </div>
                
                <div class="rec-footer">
                    <div class="rec-time">推荐时间: ${rec.recommendTime || formatTime()}</div>
                    <button class="btn-detail" onclick="event.stopPropagation(); window.location.href='detail.html?id=${rec.id || index + 1}'">
                        查看详情 →
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========== 生成模拟推荐数据 ==========
function generateMockRecommendations() {
    const mockData = [
        {
            id: 1,
            stockName: '北方华创',
            stockCode: '002371',
            score: 92,
            expectedReturn: 15.8,
            confidence: '高',
            strategy: '中线持有',
            targetPrice: 360.00,
            reason: '半导体设备国产替代龙头,订单饱满,业绩增长确定性强,技术面突破关键压力位',
            tags: ['技术面突破', '行业景气', '机构增持']
        },
        {
            id: 2,
            stockName: '药明康德',
            stockCode: '603259',
            score: 88,
            expectedReturn: 12.5,
            confidence: '高',
            strategy: '短线波段',
            targetPrice: 115.00,
            reason: 'CRO行业景气度上行,Q1业绩超预期,机构持续加仓,短期回调提供买点',
            tags: ['业绩超预期', '机构看好', '估值合理']
        },
        {
            id: 3,
            stockName: '宁德时代',
            stockCode: '300750',
            score: 85,
            expectedReturn: 10.2,
            confidence: '中',
            strategy: '长线配置',
            targetPrice: 210.00,
            reason: '新能源汽车销量持续增长,动力电池龙头地位稳固,长期成长空间大',
            tags: ['行业龙头', '长期成长', '估值偏高']
        },
        {
            id: 4,
            stockName: '海康威视',
            stockCode: '002415',
            score: 82,
            expectedReturn: 8.5,
            confidence: '中',
            strategy: '中线持有',
            targetPrice: 50.00,
            reason: 'AI+安防双轮驱动,业绩稳健增长,分红率高,适合稳健投资者',
            tags: ['AI概念', '稳健增长', '高分红']
        },
        {
            id: 5,
            stockName: '中芯国际',
            stockCode: '688981',
            score: 78,
            expectedReturn: 6.8,
            confidence: '中',
            strategy: '短线关注',
            targetPrice: 52.00,
            reason: '芯片制造国产化进程加速,技术突破预期,短期波动较大,适合波段操作',
            tags: ['国产替代', '技术突破', '波动较大']
        }
    ];
    
    return mockData.map(item => ({
        ...item,
        recommendTime: new Date().toISOString().split('T')[0] + ' ' + formatTime()
    }));
}

// ========== 筛选功能 ==========
function filterRecommendations(filterType) {
    // 实际项目中应该根据筛选条件重新请求 API
    console.log('筛选类型:', filterType);
    loadRecommendations();
}

// ========== 排序功能 ==========
function sortRecommendations(sortType) {
    console.log('排序类型:', sortType);
    // 实际项目中应该根据排序条件重新请求 API
    loadRecommendations();
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendations();
    
    // 绑定筛选器
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            filterRecommendations(e.target.value);
        });
    }
    
    // 绑定排序
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortRecommendations(e.target.value);
        });
    }
    
    // 自动刷新（每 5 分钟）
    setInterval(() => {
        loadRecommendations();
    }, 300000);
});
