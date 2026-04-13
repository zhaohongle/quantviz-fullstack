// ========== QuantViz API Integration Library ==========
// 统一的API集成模块，供所有页面使用

const API_BASE_URL = 'http://localhost:3000/api';

// ========== Mock Data（降级使用） ==========
const mockData = {
    indices: [
        { name: '上证指数', code: '000001', price: 3241.28, change: 1.46, changePercent: 1.46 },
        { name: '深证成指', code: '399001', price: 11240.56, change: 2.12, changePercent: 2.12 },
        { name: '科创50', code: '000688', price: 1045.32, change: 3.33, changePercent: 3.33 },
        { name: '纳斯达克', code: '^IXIC', price: 14231.77, change: -0.44, changePercent: -0.44 },
        { name: '标普 500', code: '^GSPC', price: 4587.18, change: -0.28, changePercent: -0.28 },
        { name: '道琼斯', code: '^DJI', price: 35677.02, change: -0.15, changePercent: -0.15 }
    ],
    news: [
        {
            time: '16:14',
            source: '新浪财经',
            title: '沪指大涨1.46%，半导体板块领涨',
            summary: '科创50暴涨3.33%，市场情绪高涨...',
            tags: ['半导体', '科创板']
        }
    ],
    stocks: [],
    sectors: [],
    recommendations: [],
    ranking: { gainers: [], losers: [] }
};

// ========== API Functions ==========

/**
 * 通用 API 请求函数
 * @param {string} endpoint - API 端点
 * @param {any} fallbackData - 降级数据
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, fallbackData = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data || result;
    } catch (error) {
        console.error(`❌ API请求失败 [${endpoint}]:`, error.message);
        if (fallbackData) {
            console.warn(`⚠️ 使用降级数据 [${endpoint}]`);
            return fallbackData;
        }
        throw error;
    }
}

// 获取指数数据
async function fetchIndices() {
    return apiRequest('indices', mockData.indices);
}

// 获取股票数据
async function fetchStocks(codes = null) {
    const endpoint = codes ? `stocks?codes=${codes}` : 'stocks';
    return apiRequest(endpoint, mockData.stocks);
}

// 获取板块数据
async function fetchSectors() {
    return apiRequest('sectors', mockData.sectors);
}

// 获取新闻数据
async function fetchNews() {
    return apiRequest('news', mockData.news);
}

// 获取AI推荐
async function fetchRecommendations() {
    return apiRequest('recommendations', mockData.recommendations);
}

// 获取涨跌榜
async function fetchRanking() {
    return apiRequest('ranking', mockData.ranking);
}

// 获取完整数据
async function fetchAllData() {
    return apiRequest('data', {
        indices: mockData.indices,
        stocks: mockData.stocks,
        sectors: mockData.sectors,
        news: mockData.news,
        recommendations: mockData.recommendations,
        ranking: mockData.ranking
    });
}

// ========== Helper Functions ==========

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
function formatPrice(price, decimals = 2) {
    return price.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * 格式化涨跌幅
 * @param {number} change - 涨跌幅
 * @returns {object} { text, class, arrow }
 */
function formatChange(change) {
    const sign = change > 0 ? '+' : '';
    const className = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    
    return {
        text: `${sign}${change.toFixed(2)}%`,
        class: className,
        arrow: arrow
    };
}

/**
 * 格式化时间
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string} HH:MM 格式
 */
function formatTime(date = new Date()) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 显示加载状态
 * @param {string} containerId - 容器ID
 * @param {boolean} show - 是否显示
 */
function showLoading(containerId, show = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (show) {
        container.innerHTML = '<div class="loading">加载中...</div>';
    }
}

/**
 * 显示错误信息
 * @param {string} containerId - 容器ID
 * @param {string} message - 错误信息
 */
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="error">❌ ${message}</div>`;
}

// ========== Export ==========
// 如果使用模块化，可以导出这些函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchIndices,
        fetchStocks,
        fetchSectors,
        fetchNews,
        fetchRecommendations,
        fetchRanking,
        fetchAllData,
        formatPrice,
        formatChange,
        formatTime,
        showLoading,
        showError
    };
}

console.log('✅ API Integration Library loaded');
