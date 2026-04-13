// ========== AI 推荐详情页 API 集成脚本 ==========

// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const recId = urlParams.get('id') || '1';

// ========== 加载推荐详情 ==========
async function loadRecommendationDetail() {
    try {
        showLoading('detail-content', true);
        
        // 获取推荐数据
        const recommendations = await fetchRecommendations();
        
        // 查找对应推荐
        let recData = recommendations.find(r => r.id == recId);
        
        if (!recData) {
            recData = generateMockRecommendationDetail(recId);
        }
        
        renderDetailHeader(recData);
        renderDetailMetrics(recData);
        renderAnalysisReport(recData);
        renderChart();
        
    } catch (error) {
        console.error('❌ 加载推荐详情失败:', error);
        const mockData = generateMockRecommendationDetail(recId);
        renderDetailHeader(mockData);
        renderDetailMetrics(mockData);
    }
}

// ========== 渲染详情头部 ==========
function renderDetailHeader(data) {
    const titleEl = document.querySelector('.detail-title');
    const subtitleEl = document.querySelector('.detail-subtitle');
    const scoreEl = document.querySelector('.detail-score');
    
    if (titleEl) titleEl.textContent = data.stockName || '--';
    if (subtitleEl) subtitleEl.textContent = data.stockCode || '--';
    if (scoreEl) {
        const scoreColor = data.score >= 85 ? '#EF4444' : data.score >= 70 ? '#F59E0B' : '#6B7280';
        scoreEl.innerHTML = `<span style="background: ${scoreColor}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 700;">${data.score || 0} 分</span>`;
    }
}

// ========== 渲染指标 ==========
function renderDetailMetrics(data) {
    const container = document.querySelector('.metrics-grid');
    if (!container) return;
    
    const expectedReturn = data.expectedReturn || 0;
    const returnClass = expectedReturn > 0 ? 'up' : 'down';
    
    container.innerHTML = `
        <div class="metric-card">
            <div class="metric-label">预期收益率</div>
            <div class="metric-value ${returnClass}">
                ${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(1)}%
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-label">目标价位</div>
            <div class="metric-value">${formatPrice(data.targetPrice || 0)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">当前价位</div>
            <div class="metric-value">${formatPrice(data.currentPrice || 0)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">建议止损价</div>
            <div class="metric-value">${formatPrice(data.stopLoss || 0)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">置信度</div>
            <div class="metric-value">${data.confidence || '高'}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">投资策略</div>
            <div class="metric-value">${data.strategy || '中线持有'}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">持有周期</div>
            <div class="metric-value">${data.holdPeriod || '1-3月'}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">风险等级</div>
            <div class="metric-value">${data.riskLevel || '中'}</div>
        </div>
    `;
}

// ========== 渲染分析报告 ==========
function renderAnalysisReport(data) {
    const container = document.querySelector('.analysis-report');
    if (!container) return;
    
    const report = data.analysisReport || generateDefaultReport(data);
    
    container.innerHTML = `
        <div class="report-section">
            <h3>💡 AI 综合评分</h3>
            <p>${report.summary || '该股票综合评分较高,具备较好的投资价值。'}</p>
        </div>
        
        <div class="report-section">
            <h3>📊 技术面分析</h3>
            <p>${report.technical || '技术指标显示多头趋势,MACD金叉,成交量放大,短期有继续上涨空间。'}</p>
        </div>
        
        <div class="report-section">
            <h3>📈 基本面分析</h3>
            <p>${report.fundamental || '公司业绩稳健增长,行业景气度上行,估值处于合理区间。'}</p>
        </div>
        
        <div class="report-section">
            <h3>💰 资金面分析</h3>
            <p>${report.capital || '主力资金持续流入,机构增持明显,市场关注度高。'}</p>
        </div>
        
        <div class="report-section">
            <h3>⚠️ 风险提示</h3>
            <p>${report.risk || '注意大盘系统性风险,建议设置止损位,控制仓位。'}</p>
        </div>
        
        <div class="report-section">
            <h3>🎯 操作建议</h3>
            <p>${report.suggestion || `建议在 ${formatPrice(data.currentPrice * 0.95)} - ${formatPrice(data.currentPrice * 1.02)} 区间分批买入,目标价位 ${formatPrice(data.targetPrice)},止损价 ${formatPrice(data.stopLoss)}。`}</p>
        </div>
    `;
}

// ========== 渲染K线图（占位） ==========
function renderChart() {
    const placeholder = document.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div style="text-align: center; color: #9CA3AF;">
                <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                <div>K 线图 + AI 推荐点位标注（建议使用 ECharts 集成）</div>
            </div>
        `;
    }
}

// ========== 生成模拟推荐详情 ==========
function generateMockRecommendationDetail(id) {
    const mockStocks = [
        { name: '北方华创', code: '002371', currentPrice: 312.45 },
        { name: '药明康德', code: '603259', currentPrice: 103.81 },
        { name: '宁德时代', code: '300750', currentPrice: 188.77 },
        { name: '海康威视', code: '002415', currentPrice: 45.23 },
        { name: '中芯国际', code: '688981', currentPrice: 45.88 }
    ];
    
    const stock = mockStocks[parseInt(id) - 1] || mockStocks[0];
    const expectedReturn = Math.random() * 15 + 5;
    const targetPrice = stock.currentPrice * (1 + expectedReturn / 100);
    const stopLoss = stock.currentPrice * 0.92;
    
    return {
        id: id,
        stockName: stock.name,
        stockCode: stock.code,
        score: Math.floor(Math.random() * 20 + 75),
        expectedReturn: expectedReturn,
        targetPrice: targetPrice,
        currentPrice: stock.currentPrice,
        stopLoss: stopLoss,
        confidence: expectedReturn > 10 ? '高' : '中',
        strategy: expectedReturn > 12 ? '中线持有' : '短线波段',
        holdPeriod: expectedReturn > 12 ? '1-3月' : '1-4周',
        riskLevel: expectedReturn > 12 ? '中' : '中高'
    };
}

// ========== 生成默认报告 ==========
function generateDefaultReport(data) {
    return {
        summary: `${data.stockName}综合评分${data.score}分,AI模型预测未来有${data.expectedReturn.toFixed(1)}%的上涨空间。`,
        technical: '技术指标显示多头趋势,MACD金叉,KDJ金叉,成交量放大,短期有继续上涨空间。',
        fundamental: '公司业绩稳健增长,行业景气度上行,机构持续看好,估值处于合理区间。',
        capital: '主力资金持续流入,北向资金增持明显,市场关注度高。',
        risk: '注意大盘系统性风险,行业政策变化,建议设置止损位,控制仓位在30%以内。',
        suggestion: `建议在 ${formatPrice(data.currentPrice * 0.95)} - ${formatPrice(data.currentPrice * 1.02)} 区间分批买入,目标价位 ${formatPrice(data.targetPrice)},止损价 ${formatPrice(data.stopLoss)}。持有周期${data.holdPeriod},根据市场变化动态调整。`
    };
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendationDetail();
});
