// ========== 气泡图视图 API 集成脚本 ==========

// ========== 加载板块数据 ==========
async function loadBubbleChart() {
    try {
        showLoading('bubble-container', true);
        
        // 获取板块数据
        const sectorsData = await fetchSectors();
        
        if (!sectorsData || sectorsData.length === 0) {
            const mockData = generateMockSectors();
            renderBubbleChart(mockData);
            return;
        }
        
        renderBubbleChart(sectorsData);
        
    } catch (error) {
        console.error('❌ 加载气泡图数据失败:', error);
        const mockData = generateMockSectors();
        renderBubbleChart(mockData);
    }
}

// ========== 渲染气泡图（ECharts 占位） ==========
function renderBubbleChart(data) {
    const container = document.getElementById('bubble-container');
    if (!container) return;
    
    // 实际项目中应该使用 ECharts 绘制气泡图
    // 这里使用占位符
    container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9CA3AF;">
            <div style="font-size: 64px; margin-bottom: 24px;">🫧</div>
            <div style="font-size: 18px; margin-bottom: 12px;">气泡图视图（建议使用 ECharts 集成）</div>
            <div style="font-size: 14px; margin-bottom: 24px;">气泡大小代表市值，颜色代表涨跌幅</div>
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; max-width: 600px;">
                <div style="font-weight: 600; margin-bottom: 8px;">📊 数据预览：</div>
                <div style="font-size: 12px; line-height: 1.8; color: #6B7280;">
                    ${data.slice(0, 5).map(s => 
                        `• ${s.name}: ${(s.changePercent || 0) > 0 ? '+' : ''}${(s.changePercent || 0).toFixed(2)}% (资金${(s.moneyFlow || 0) > 0 ? '流入' : '流出'} ${Math.abs(s.moneyFlow || 0).toFixed(0)}亿)`
                    ).join('<br>')}
                </div>
            </div>
            <button onclick="window.location.href='sectors.html'" 
                    style="margin-top: 24px; padding: 12px 24px; background: #1E3A8A; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                返回列表视图
            </button>
        </div>
    `;
}

// ========== 生成模拟板块数据 ==========
function generateMockSectors() {
    const sectorNames = [
        '半导体', '新能源汽车', '医药生物', '人工智能', '5G通信',
        '军工', '新材料', '环保', '消费电子', '锂电池',
        '光伏', '风电', '芯片', '生物医药', '互联网',
        '银行', '房地产', '煤炭', '钢铁', '有色金属'
    ];
    
    return sectorNames.map((name, index) => {
        const changePercent = (Math.random() - 0.3) * 6;
        
        return {
            id: name,
            name: name,
            changePercent: changePercent,
            moneyFlow: changePercent > 0 
                ? (Math.random() * 400 + 100) 
                : -(Math.random() * 200 + 50),
            marketCap: Math.random() * 5000 + 1000 // 市值（亿元）
        };
    });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadBubbleChart();
    
    // 绑定返回按钮
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'sectors.html';
        });
    }
});
