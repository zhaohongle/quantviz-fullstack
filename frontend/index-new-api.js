// ========== 主页 API 集成脚本 ==========

// ========== 加载实时数据到主页 ==========
async function loadDashboardData() {
    try {
        // 并行加载所有数据
        const [indices, sectors, recommendations, news] = await Promise.all([
            fetchIndices(),
            fetchSectors(),
            fetchRecommendations(),
            fetchNews()
        ]);
        
        // 更新统计数据
        updateStats(indices, sectors, recommendations);
        
        // 更新快捷访问卡片的实时信息
        updateCardData(indices, sectors, recommendations, news);
        
    } catch (error) {
        console.error('❌ 加载主页数据失败:', error);
        // 使用默认数据，不影响页面显示
    }
}

// ========== 更新统计数据 ==========
function updateStats(indices, sectors, recommendations) {
    // 更新高亮区域的统计信息
    const highlightSection = document.querySelector('.highlight-section');
    if (!highlightSection) return;
    
    const indicesCount = indices.length || 6;
    const sectorsCount = sectors.length || 20;
    const recsCount = recommendations.length || 5;
    const upIndices = indices.filter(i => (i.changePercent || 0) > 0).length;
    
    // 更新高亮列表
    const highlightList = highlightSection.querySelector('.highlight-list');
    if (highlightList) {
        highlightList.innerHTML = `
            <div class="highlight-item">✓ ${indicesCount} 个全球主要指数实时追踪</div>
            <div class="highlight-item">✓ ${sectorsCount}+ 个行业板块资金流向</div>
            <div class="highlight-item">✓ ${recsCount} 个 AI 精选推荐</div>
            <div class="highlight-item">✓ ${upIndices}/${indicesCount} 指数今日上涨</div>
        `;
    }
}

// ========== 更新卡片数据 ==========
function updateCardData(indices, sectors, recommendations, news) {
    // PRD-1 卡片：显示涨幅最大的指数
    updatePRD1Card(indices);
    
    // PRD-2 卡片：显示资金流入最大的板块
    updatePRD2Card(sectors);
    
    // PRD-3 卡片：显示最新推荐
    updatePRD3Card(recommendations);
    
    // 更新页脚的最后更新时间
    updateLastUpdateTime();
}

// ========== 更新 PRD-1 卡片 ==========
function updatePRD1Card(indices) {
    const card = document.querySelector('a[href*="prd1"]');
    if (!card) return;
    
    const sortedIndices = [...indices].sort((a, b) => 
        (b.changePercent || 0) - (a.changePercent || 0)
    );
    
    const topIndex = sortedIndices[0];
    if (topIndex) {
        const desc = card.querySelector('.card-desc');
        if (desc) {
            desc.innerHTML = `查看全球主要指数实时行情，配合资讯分析把握市场动向。<br><strong style="color: #EF4444;">今日领涨：${topIndex.name} ${topIndex.changePercent > 0 ? '+' : ''}${(topIndex.changePercent || 0).toFixed(2)}%</strong>`;
        }
    }
}

// ========== 更新 PRD-2 卡片 ==========
function updatePRD2Card(sectors) {
    const card = document.querySelector('a[href*="prd2"]');
    if (!card) return;
    
    if (sectors.length === 0) return;
    
    const sortedSectors = [...sectors].sort((a, b) => 
        (b.moneyFlow || 0) - (a.moneyFlow || 0)
    );
    
    const topSector = sortedSectors[0];
    if (topSector) {
        const desc = card.querySelector('.card-desc');
        if (desc) {
            desc.innerHTML = `实时监控行业资金流向，发现主力动向，把握板块轮动机会。<br><strong style="color: #EF4444;">今日流入最多：${topSector.name || '--'} +${(topSector.moneyFlow || 0).toFixed(0)}亿</strong>`;
        }
    }
}

// ========== 更新 PRD-3 卡片 ==========
function updatePRD3Card(recommendations) {
    const card = document.querySelector('a[href*="prd3"]');
    if (!card) return;
    
    if (recommendations.length === 0) return;
    
    const latestRec = recommendations[0];
    if (latestRec) {
        const desc = card.querySelector('.card-desc');
        if (desc) {
            desc.innerHTML = `AI 算法综合技术面、基本面、资金面，为您筛选优质标的。<br><strong style="color: #EF4444;">最新推荐：${latestRec.stockName || '--'} (评分 ${latestRec.score || 0})</strong>`;
        }
    }
}

// ========== 更新最后更新时间 ==========
function updateLastUpdateTime() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const existingTime = footer.querySelector('.update-time');
    if (existingTime) {
        existingTime.textContent = `最后更新: ${timeStr}`;
    } else {
        const timeEl = document.createElement('div');
        timeEl.className = 'update-time';
        timeEl.style.marginTop = '12px';
        timeEl.style.fontSize = '14px';
        timeEl.style.opacity = '0.8';
        timeEl.textContent = `最后更新: ${timeStr}`;
        footer.appendChild(timeEl);
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    // 加载实时数据
    loadDashboardData();
    
    // 每 30 秒刷新一次数据
    setInterval(() => {
        loadDashboardData();
    }, 30000);
    
    // 添加卡片点击跟踪（可选）
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            console.log('导航到:', href);
        });
    });
});
