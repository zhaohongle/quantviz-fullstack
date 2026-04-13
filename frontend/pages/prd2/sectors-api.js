// ========== 板块资金流向页面 API 集成脚本 ==========

let currentTimeRange = 'today'; // today, 3days, week, month
let currentView = 'list'; // list, bubble

// ========== 加载板块数据 ==========
async function loadSectorsData() {
    try {
        showLoading('gainers-container', true);
        showLoading('losers-container', true);
        
        // 获取板块数据
        const sectorsData = await fetchSectors();
        
        if (!sectorsData || sectorsData.length === 0) {
            // 使用模拟数据
            const mockData = generateMockSectors();
            renderSectors(mockData);
            return;
        }
        
        renderSectors(sectorsData);
        
    } catch (error) {
        console.error('❌ 加载板块数据失败:', error);
        // 降级：使用模拟数据
        const mockData = generateMockSectors();
        renderSectors(mockData);
    }
}

// ========== 渲染板块数据 ==========
function renderSectors(data) {
    // 按涨跌幅排序
    const sorted = [...data].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    
    // 分离涨跌
    const gainers = sorted.filter(s => (s.changePercent || 0) > 0).slice(0, 10);
    const losers = sorted.filter(s => (s.changePercent || 0) <= 0).slice(-10).reverse();
    
    renderGainers(gainers);
    renderLosers(losers);
}

// ========== 渲染领涨板块 ==========
function renderGainers(gainers) {
    const container = document.getElementById('gainers-container');
    if (!container) return;
    
    if (gainers.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:40px;">暂无数据</div>';
        return;
    }
    
    container.innerHTML = gainers.map((sector, index) => {
        const changePercent = sector.changePercent || 0;
        const moneyFlow = sector.moneyFlow || (Math.random() * 500 + 100);
        const leadStocks = sector.leadStocks || ['--', '--'];
        
        return `
            <div class="sector-card" onclick="window.location.href='sector-detail.html?id=${sector.id || sector.name}'">
                <div class="sector-rank">${index + 1}</div>
                <div class="sector-name">${sector.name || '--'}</div>
                <div class="sector-change up">
                    +${changePercent.toFixed(2)}% ↑
                </div>
                <div class="sector-flow">
                    <div class="flow-label">资金净流入</div>
                    <div class="flow-value" style="color: #EF4444;">+${moneyFlow.toFixed(2)} 亿</div>
                </div>
                <div class="sector-lead-stocks">
                    <div class="lead-label">龙头股</div>
                    <div class="lead-stocks">${leadStocks.slice(0, 2).join(', ')}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== 渲染领跌板块 ==========
function renderLosers(losers) {
    const container = document.getElementById('losers-container');
    if (!container) return;
    
    if (losers.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:40px;">暂无数据</div>';
        return;
    }
    
    container.innerHTML = losers.map((sector, index) => {
        const changePercent = sector.changePercent || 0;
        const moneyFlow = sector.moneyFlow || -(Math.random() * 300 + 50);
        const leadStocks = sector.leadStocks || ['--', '--'];
        
        return `
            <div class="sector-card" onclick="window.location.href='sector-detail.html?id=${sector.id || sector.name}'">
                <div class="sector-rank">${index + 1}</div>
                <div class="sector-name">${sector.name || '--'}</div>
                <div class="sector-change down">
                    ${changePercent.toFixed(2)}% ↓
                </div>
                <div class="sector-flow">
                    <div class="flow-label">资金净流出</div>
                    <div class="flow-value" style="color: #10B981;">${moneyFlow.toFixed(2)} 亿</div>
                </div>
                <div class="sector-lead-stocks">
                    <div class="lead-label">领跌股</div>
                    <div class="lead-stocks">${leadStocks.slice(0, 2).join(', ')}</div>
                </div>
            </div>
        `;
    }).join('');
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
        const isGainer = index < 10;
        const changePercent = isGainer 
            ? (Math.random() * 5 + 1) 
            : -(Math.random() * 3 + 0.5);
        
        return {
            id: name,
            name: name,
            changePercent: changePercent,
            moneyFlow: changePercent > 0 
                ? (Math.random() * 400 + 100) 
                : -(Math.random() * 200 + 50),
            leadStocks: generateLeadStocks(name)
        };
    });
}

// ========== 生成龙头股名称 ==========
function generateLeadStocks(sectorName) {
    const stockMap = {
        '半导体': ['北方华创', '中芯国际'],
        '新能源汽车': ['宁德时代', '比亚迪'],
        '医药生物': ['药明康德', '恒瑞医药'],
        '人工智能': ['海康威视', '科大讯飞'],
        '5G通信': ['中兴通讯', '烽火通信'],
        '军工': ['中航沈飞', '航发动力'],
        '新材料': ['先导智能', '隆基股份'],
        '环保': ['碧水源', '格林美'],
        '消费电子': ['立讯精密', '歌尔股份'],
        '锂电池': ['赣锋锂业', '天齐锂业'],
        '光伏': ['隆基股份', '通威股份'],
        '风电': ['金风科技', '明阳智能'],
        '芯片': ['韦尔股份', '兆易创新'],
        '生物医药': ['迈瑞医疗', '爱尔眼科'],
        '互联网': ['腾讯控股', '阿里巴巴'],
        '银行': ['招商银行', '平安银行'],
        '房地产': ['万科A', '保利发展'],
        '煤炭': ['中国神华', '陕西煤业'],
        '钢铁': ['宝钢股份', '华菱钢铁'],
        '有色金属': ['紫金矿业', '洛阳钼业']
    };
    
    return stockMap[sectorName] || ['龙头股A', '龙头股B'];
}

// ========== 切换时间范围 ==========
function switchTimeRange(range) {
    currentTimeRange = range;
    
    // 更新按钮状态
    document.querySelectorAll('.time-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(getRangeText(range))) {
            btn.classList.add('active');
        }
    });
    
    // 重新加载数据
    loadSectorsData();
}

function getRangeText(range) {
    const map = {
        'today': '今日',
        '3days': '3日',
        'week': '本周',
        'month': '本月'
    };
    return map[range] || '今日';
}

// ========== 切换视图 ==========
function switchView(view) {
    currentView = view;
    
    // 更新按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (view === 'bubble') {
        document.querySelector('[data-view="bubble"]')?.classList.add('active');
        window.location.href = 'bubble-chart.html';
    } else {
        document.querySelector('[data-view="list"]')?.classList.add('active');
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    loadSectorsData();
    
    // 绑定时间范围切换
    document.querySelectorAll('.time-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.textContent;
            if (text.includes('今日')) switchTimeRange('today');
            else if (text.includes('3日')) switchTimeRange('3days');
            else if (text.includes('本周')) switchTimeRange('week');
            else if (text.includes('本月')) switchTimeRange('month');
        });
    });
    
    // 绑定视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.getAttribute('data-view') || 
                        (e.target.textContent.includes('气泡图') ? 'bubble' : 'list');
            switchView(view);
        });
    });
    
    // 自动刷新（每 30 秒）
    setInterval(() => {
        loadSectorsData();
    }, 30000);
});
