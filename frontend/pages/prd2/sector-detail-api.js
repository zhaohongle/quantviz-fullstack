// ========== 板块详情页 API 集成脚本 ==========

// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const sectorId = urlParams.get('id') || '半导体';

// ========== 加载板块详情 ==========
async function loadSectorDetail() {
    try {
        showLoading('sector-stats', true);
        
        // 获取板块数据
        const sectorsData = await fetchSectors();
        
        // 查找当前板块
        let sectorData = sectorsData.find(s => s.id === sectorId || s.name === sectorId);
        
        if (!sectorData) {
            // 使用模拟数据
            sectorData = generateMockSectorDetail(sectorId);
        }
        
        // 渲染页面
        renderSectorHeader(sectorData);
        renderSectorStats(sectorData);
        renderTrendChart(sectorData);
        renderConstituents(sectorData);
        
    } catch (error) {
        console.error('❌ 加载板块详情失败:', error);
        const mockData = generateMockSectorDetail(sectorId);
        renderSectorHeader(mockData);
        renderSectorStats(mockData);
    }
}

// ========== 渲染板块头部 ==========
function renderSectorHeader(data) {
    const titleEl = document.querySelector('.sector-title');
    const breadcrumbEl = document.querySelector('.breadcrumb');
    
    if (titleEl) {
        titleEl.textContent = data.name || sectorId;
    }
    
    if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `
            <a href="../../index-new.html">首页</a> / 
            <a href="sectors.html">板块资金流向</a> / 
            ${data.name || sectorId}
        `;
    }
}

// ========== 渲染统计数据 ==========
function renderSectorStats(data) {
    const statsEl = document.getElementById('sector-stats');
    if (!statsEl) return;
    
    const changePercent = data.changePercent || 0;
    const changeClass = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
    const moneyFlow = data.moneyFlow || (changePercent > 0 ? 285.12 : -128.45);
    const avgChange = changePercent;
    const upCount = Math.floor(Math.random() * 50 + 30);
    const downCount = Math.floor(Math.random() * 30 + 10);
    const totalCount = upCount + downCount;
    const upRatio = ((upCount / totalCount) * 100).toFixed(1);
    
    statsEl.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">板块涨跌幅</div>
            <div class="stat-value ${changeClass}">
                ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}% 
                ${changePercent > 0 ? '↑' : changePercent < 0 ? '↓' : '→'}
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">资金净流入</div>
            <div class="stat-value ${moneyFlow > 0 ? 'up' : 'down'}">
                ${moneyFlow > 0 ? '+' : ''}${moneyFlow.toFixed(2)} 亿
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">平均涨幅</div>
            <div class="stat-value ${changeClass}">
                ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-label">上涨家数</div>
            <div class="stat-value">${upCount} 只</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">下跌家数</div>
            <div class="stat-value">${downCount} 只</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">上涨占比</div>
            <div class="stat-value">${upRatio}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">成交总额</div>
            <div class="stat-value">${(Math.random() * 2000 + 500).toFixed(0)} 亿</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">换手率</div>
            <div class="stat-value">${(Math.random() * 5 + 2).toFixed(2)}%</div>
        </div>
    `;
}

// ========== 渲染趋势图（占位） ==========
function renderTrendChart(data) {
    const placeholder = document.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div style="text-align: center; color: #9CA3AF;">
                <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                <div>资金流向趋势图（建议使用 ECharts 集成）</div>
                <div style="font-size: 12px; margin-top: 8px;">显示最近 30 天的资金流入流出趋势</div>
            </div>
        `;
    }
}

// ========== 渲染成分股 ==========
async function renderConstituents(sectorData) {
    const tbody = document.querySelector('.constituents-table tbody');
    if (!tbody) return;
    
    try {
        // 尝试从 API 获取股票数据
        const stocks = await fetchStocks();
        
        // 模拟：取前 20 只股票作为成分股
        const constituents = stocks.slice(0, 20);
        
        if (constituents.length === 0) {
            tbody.innerHTML = generateMockConstituents(sectorData.name);
            return;
        }
        
        tbody.innerHTML = constituents.map((stock, index) => {
            const changeClass = (stock.changePercent || 0) > 0 ? 'up' : 'down';
            const moneyFlow = (Math.random() - 0.5) * 50;
            const moneyFlowClass = moneyFlow > 0 ? 'up' : 'down';
            
            return `
                <tr onclick="window.location.href='../../pages/stock-detail.html?code=${stock.code}'">
                    <td>${index + 1}</td>
                    <td>
                        <div style="font-weight: 600;">${stock.name}</div>
                        <div style="font-size: 12px; color: #9CA3AF;">${stock.code}</div>
                    </td>
                    <td class="table-number">${formatPrice(stock.price || 0)}</td>
                    <td class="table-number ${changeClass}">
                        ${(stock.changePercent || 0) > 0 ? '+' : ''}${(stock.changePercent || 0).toFixed(2)}%
                    </td>
                    <td class="table-number ${moneyFlowClass}">
                        ${moneyFlow > 0 ? '+' : ''}${moneyFlow.toFixed(2)} 亿
                    </td>
                    <td class="table-number">${(Math.random() * 100 + 50).toFixed(0)} 亿</td>
                    <td class="table-number">${(Math.random() * 8 + 2).toFixed(2)}%</td>
                    <td>
                        <span class="badge ${index < 3 ? 'badge-hot' : index < 10 ? 'badge-active' : 'badge-normal'}">
                            ${index < 3 ? '龙头' : index < 10 ? '活跃' : '关注'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ 加载成分股失败:', error);
        tbody.innerHTML = generateMockConstituents(sectorData.name);
    }
}

// ========== 生成模拟板块详情 ==========
function generateMockSectorDetail(name) {
    const changePercent = Math.random() * 6 + 0.5;
    return {
        id: name,
        name: name,
        changePercent: changePercent,
        moneyFlow: changePercent > 0 ? (Math.random() * 400 + 100) : -(Math.random() * 200 + 50),
        leadStocks: ['龙头股A', '龙头股B', '龙头股C']
    };
}

// ========== 生成模拟成分股 ==========
function generateMockConstituents(sectorName) {
    const mockStocks = [
        { name: '龙头股A', code: '600001', price: 45.23, change: 8.52 },
        { name: '龙头股B', code: '600002', price: 128.77, change: 6.18 },
        { name: '龙头股C', code: '600003', price: 88.45, change: 4.92 },
        { name: '成分股D', code: '600004', price: 32.18, change: 3.67 },
        { name: '成分股E', code: '600005', price: 56.92, change: 2.88 },
        { name: '成分股F', code: '600006', price: 24.55, change: 2.15 },
        { name: '成分股G', code: '600007', price: 78.33, change: 1.82 },
        { name: '成分股H', code: '600008', price: 112.88, change: 1.45 },
        { name: '成分股I', code: '600009', price: 42.77, change: 0.92 },
        { name: '成分股J', code: '600010', price: 68.12, change: 0.55 }
    ];
    
    return mockStocks.map((stock, index) => {
        const changeClass = stock.change > 0 ? 'up' : 'down';
        const moneyFlow = (Math.random() - 0.5) * 50;
        const moneyFlowClass = moneyFlow > 0 ? 'up' : 'down';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div style="font-weight: 600;">${stock.name}</div>
                    <div style="font-size: 12px; color: #9CA3AF;">${stock.code}</div>
                </td>
                <td class="table-number">${formatPrice(stock.price)}</td>
                <td class="table-number ${changeClass}">+${stock.change.toFixed(2)}%</td>
                <td class="table-number ${moneyFlowClass}">
                    ${moneyFlow > 0 ? '+' : ''}${moneyFlow.toFixed(2)} 亿
                </td>
                <td class="table-number">${(Math.random() * 100 + 50).toFixed(0)} 亿</td>
                <td class="table-number">${(Math.random() * 8 + 2).toFixed(2)}%</td>
                <td>
                    <span class="badge ${index < 3 ? 'badge-hot' : index < 10 ? 'badge-active' : 'badge-normal'}">
                        ${index < 3 ? '龙头' : index < 10 ? '活跃' : '关注'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadSectorDetail();
    
    // 绑定时间周期按钮
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});
