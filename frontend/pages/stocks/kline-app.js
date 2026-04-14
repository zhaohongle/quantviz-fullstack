// ========================================
// K线图应用主逻辑
// ========================================

class KlineApp {
    constructor() {
        // 图表实例
        this.klineChart = new KlineChartRenderer('klineChart');
        this.volumeChart = new VolumeChartRenderer('volumeChart');
        this.indicatorChart = new IndicatorChartRenderer('indicatorChart');
        
        // 数据存储
        this.rawData = [];
        this.currentPeriod = '1d';
        this.currentIndicator = 'macd';
        this.stockSymbol = 'sh000001';  // 默认上证指数
        
        // 技术指标数据缓存
        this.cachedIndicators = {};
        
        // 初始化
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 从 URL 获取股票代码
        const urlParams = new URLSearchParams(window.location.search);
        this.stockSymbol = urlParams.get('symbol') || 'sh000001';
        
        // 绑定事件
        this.bindEvents();
        
        // 加载数据
        this.loadData();
        
        // 响应式调整
        window.addEventListener('resize', () => {
            this.klineChart.resize();
            this.volumeChart.resize();
            this.indicatorChart.resize();
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 周期切换
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.switchPeriod(period);
            });
        });
        
        // 技术指标切换
        document.querySelectorAll('.indicator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indicator = e.target.dataset.indicator;
                this.switchIndicator(indicator);
            });
        });
    }

    /**
     * 切换周期
     */
    switchPeriod(period) {
        if (this.currentPeriod === period) return;
        
        this.currentPeriod = period;
        
        // 更新按钮状态
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        // 重新加载数据
        this.loadData();
    }

    /**
     * 切换技术指标
     */
    switchIndicator(indicator) {
        if (this.currentIndicator === indicator) return;
        
        this.currentIndicator = indicator;
        
        // 更新按钮状态
        document.querySelectorAll('.indicator-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.indicator === indicator);
        });
        
        // 渲染指标
        this.renderIndicator();
    }

    /**
     * 加载数据
     */
    async loadData() {
        try {
            // 显示加载状态
            this.showLoading();
            
            // 1. 获取股票基本信息
            const stockInfo = await this.fetchStockInfo();
            this.updateStockHeader(stockInfo);
            
            // 2. 获取K线数据
            const klineData = await this.fetchKlineData(this.stockSymbol, this.currentPeriod);
            this.rawData = klineData;
            
            // 3. 计算技术指标
            this.calculateIndicators();
            
            // 4. 渲染图表
            this.renderCharts();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('数据加载失败，请刷新页面重试');
        }
    }

    /**
     * 获取股票信息
     */
    async fetchStockInfo() {
        const response = await fetch(`/api/indices/${this.stockSymbol}`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '获取股票信息失败');
        }
        
        return result.data;
    }

    /**
     * 获取K线数据
     */
    async fetchKlineData(symbol, period) {
        const response = await fetch(`/api/indices/${symbol}/kline?period=${period}&limit=150`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '获取K线数据失败');
        }
        
        return result.data.klines;
    }

    /**
     * 更新股票头部信息
     */
    updateStockHeader(stockInfo) {
        document.getElementById('stockName').textContent = stockInfo.name || '未知';
        document.getElementById('stockCode').textContent = stockInfo.symbol || '--';
        
        // 更新统计数据
        const currentPrice = stockInfo.current_price || stockInfo.close_price || 0;
        const changeAmount = stockInfo.change_amount || 0;
        const changePercent = stockInfo.change_percent || 0;
        
        document.getElementById('currentPrice').textContent = currentPrice.toFixed(2);
        
        const changeAmountEl = document.getElementById('changeAmount');
        changeAmountEl.textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)}`;
        changeAmountEl.className = `stat-value ${changeAmount >= 0 ? 'up' : 'down'}`;
        
        const changePercentEl = document.getElementById('changePercent');
        changePercentEl.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% ${changePercent >= 0 ? '↑' : '↓'}`;
        changePercentEl.className = `stat-value ${changePercent >= 0 ? 'up' : 'down'}`;
        
        document.getElementById('openPrice').textContent = (stockInfo.open_price || 0).toFixed(2);
        document.getElementById('highPrice').textContent = (stockInfo.high_price || 0).toFixed(2);
        document.getElementById('lowPrice').textContent = (stockInfo.low_price || 0).toFixed(2);
    }

    /**
     * 计算技术指标
     */
    calculateIndicators() {
        if (!this.rawData || this.rawData.length === 0) return;
        
        // 提取收盘价
        const closePrices = this.rawData.map(item => item.close_price);
        
        // 计算移动平均线
        const maData = TechnicalIndicators.calculateMultipleMA(closePrices, [5, 10, 20, 60]);
        this.cachedIndicators.ma = maData;
        
        // 计算 MACD
        const macdData = TechnicalIndicators.calculateMACD(closePrices);
        this.cachedIndicators.macd = macdData;
        
        // 计算 KDJ
        const kdjData = TechnicalIndicators.calculateKDJ(this.rawData.map(item => ({
            high: item.high_price,
            low: item.low_price,
            close: item.close_price
        })));
        this.cachedIndicators.kdj = kdjData;
        
        // 计算 RSI
        const rsiData = TechnicalIndicators.calculateRSI(closePrices, 14);
        this.cachedIndicators.rsi = rsiData;
        
        // 计算布林带
        const bollData = TechnicalIndicators.calculateBOLL(closePrices, 20, 2);
        this.cachedIndicators.boll = bollData;
        
        console.log('技术指标计算完成:', this.cachedIndicators);
    }

    /**
     * 渲染所有图表
     */
    renderCharts() {
        // 1. 渲染K线图
        this.klineChart.setData(this.rawData);
        this.klineChart.renderKline(this.cachedIndicators.ma);
        
        // 2. 渲染成交量
        this.volumeChart.setData(this.rawData);
        this.volumeChart.render();
        
        // 3. 渲染技术指标
        this.renderIndicator();
        
        // 隐藏加载状态
        this.hideLoading();
    }

    /**
     * 渲染技术指标
     */
    renderIndicator() {
        this.indicatorChart.setDates(this.rawData);
        
        const closePrices = this.rawData.map(item => item.close_price);
        
        switch (this.currentIndicator) {
            case 'macd':
                this.indicatorChart.renderMACD(this.cachedIndicators.macd);
                break;
            case 'kdj':
                this.indicatorChart.renderKDJ(this.cachedIndicators.kdj);
                break;
            case 'rsi':
                this.indicatorChart.renderRSI(this.cachedIndicators.rsi);
                break;
            case 'boll':
                this.indicatorChart.renderBOLL(this.cachedIndicators.boll, closePrices);
                break;
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        document.getElementById('klineChart').innerHTML = '<div class="loading">加载K线数据</div>';
        document.getElementById('volumeChart').innerHTML = '<div class="loading">加载成交量数据</div>';
        document.getElementById('indicatorChart').innerHTML = '<div class="loading">加载技术指标</div>';
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        // ECharts 已经渲染，不需要额外处理
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        alert(message);
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.klineApp = new KlineApp();
});
