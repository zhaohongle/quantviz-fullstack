// ========== AI 准确率追踪页 API 集成脚本 ==========

// ========== 加载准确率数据 ==========
async function loadAccuracyData() {
    try {
        showLoading('accuracy-stats', true);
        
        // 尝试从API获取准确率数据
        // 实际应该有 GET /api/recommendations/accuracy 端点
        const response = await fetch('http://localhost:3001/api/recommendations/accuracy').catch(() => null);
        
        let accuracyData;
        if (response && response.ok) {
            const result = await response.json();
            accuracyData = result.data || result;
        } else {
            accuracyData = generateMockAccuracyData();
        }
        
        renderAccuracyStats(accuracyData);
        renderAccuracyChart(accuracyData);
        renderDetailedStats(accuracyData);
        
    } catch (error) {
        console.error('❌ 加载准确率数据失败:', error);
        const mockData = generateMockAccuracyData();
        renderAccuracyStats(mockData);
        renderAccuracyChart(mockData);
        renderDetailedStats(mockData);
    }
}

// ========== 渲染准确率统计 ==========
function renderAccuracyStats(data) {
    const container = document.getElementById('accuracy-stats');
    if (!container) return;
    
    const overall = data.overall || {};
    const short = data.shortTerm || {};
    const mid = data.midTerm || {};
    const long = data.longTerm || {};
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">总体准确率</div>
            <div class="stat-value" style="color: ${overall.accuracy >= 70 ? '#EF4444' : '#F59E0B'};">
                ${(overall.accuracy || 0).toFixed(1)}%
            </div>
            <div class="stat-sub">推荐次数: ${overall.total || 0}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">短线准确率</div>
            <div class="stat-value">${(short.accuracy || 0).toFixed(1)}%</div>
            <div class="stat-sub">1-2周持有</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">中线准确率</div>
            <div class="stat-value">${(mid.accuracy || 0).toFixed(1)}%</div>
            <div class="stat-sub">1-3月持有</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">长线准确率</div>
            <div class="stat-value">${(long.accuracy || 0).toFixed(1)}%</div>
            <div class="stat-sub">3月以上持有</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">平均收益率</div>
            <div class="stat-value up">+${(overall.avgReturn || 0).toFixed(1)}%</div>
            <div class="stat-sub">所有已完成推荐</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">最大收益</div>
            <div class="stat-value up">+${(overall.maxReturn || 0).toFixed(1)}%</div>
            <div class="stat-sub">${overall.maxReturnStock || '--'}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">最大亏损</div>
            <div class="stat-value down">${(overall.maxLoss || 0).toFixed(1)}%</div>
            <div class="stat-sub">${overall.maxLossStock || '--'}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">盈亏比</div>
            <div class="stat-value">${(overall.profitLossRatio || 0).toFixed(2)}:1</div>
            <div class="stat-sub">盈利/亏损平均值</div>
        </div>
    `;
}

// ========== 渲染准确率趋势图（占位） ==========
function renderAccuracyChart(data) {
    const placeholder = document.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div style="text-align: center; color: #9CA3AF; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div style="font-size: 18px; margin-bottom: 12px;">准确率趋势图（建议使用 ECharts 集成）</div>
                <div style="font-size: 14px;">显示最近 12 个月的准确率变化趋势</div>
            </div>
        `;
    }
}

// ========== 渲染详细统计 ==========
function renderDetailedStats(data) {
    const tbody = document.querySelector('.stats-table tbody');
    if (!tbody) return;
    
    const monthlyData = data.monthly || generateMockMonthlyData();
    
    tbody.innerHTML = monthlyData.map(month => {
        const accuracy = month.accuracy || 0;
        const accuracyClass = accuracy >= 70 ? 'up' : accuracy >= 60 ? '' : 'down';
        const avgReturn = month.avgReturn || 0;
        const returnClass = avgReturn > 0 ? 'up' : 'down';
        
        return `
            <tr>
                <td>${month.month}</td>
                <td>${month.total || 0}</td>
                <td>${month.success || 0}</td>
                <td>${month.fail || 0}</td>
                <td class="${accuracyClass}">${accuracy.toFixed(1)}%</td>
                <td class="${returnClass}">${avgReturn > 0 ? '+' : ''}${avgReturn.toFixed(1)}%</td>
                <td>${month.maxReturn > 0 ? '+' : ''}${(month.maxReturn || 0).toFixed(1)}%</td>
                <td>${(month.minReturn || 0).toFixed(1)}%</td>
            </tr>
        `;
    }).join('');
}

// ========== 生成模拟准确率数据 ==========
function generateMockAccuracyData() {
    return {
        overall: {
            accuracy: 72.5,
            total: 186,
            success: 135,
            avgReturn: 8.6,
            maxReturn: 45.2,
            maxReturnStock: '北方华创',
            maxLoss: -12.3,
            maxLossStock: '某亏损股',
            profitLossRatio: 2.8
        },
        shortTerm: {
            accuracy: 68.5,
            total: 85
        },
        midTerm: {
            accuracy: 75.2,
            total: 72
        },
        longTerm: {
            accuracy: 78.8,
            total: 29
        },
        monthly: generateMockMonthlyData()
    };
}

// ========== 生成模拟月度数据 ==========
function generateMockMonthlyData() {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const total = Math.floor(Math.random() * 20 + 10);
        const success = Math.floor(total * (0.65 + Math.random() * 0.15));
        const accuracy = (success / total) * 100;
        const avgReturn = (Math.random() * 15 + 2) * (Math.random() > 0.2 ? 1 : -1);
        
        months.push({
            month: monthStr,
            total: total,
            success: success,
            fail: total - success,
            accuracy: accuracy,
            avgReturn: avgReturn,
            maxReturn: avgReturn + Math.random() * 20 + 5,
            minReturn: avgReturn - Math.random() * 15 - 3
        });
    }
    
    return months;
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadAccuracyData();
    
    // 绑定时间周期切换
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // 实际应该根据时间范围重新加载数据
            loadAccuracyData();
        });
    });
});
