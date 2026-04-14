// ========================================
// K线图渲染核心引擎
// ========================================

/**
 * K线图渲染器
 */
class KlineChartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = echarts.init(this.container);
        this.klineData = [];
        this.dates = [];
    }

    /**
     * 设置K线数据
     * @param {Array<Object>} data - K线数据 [{date, open, high, low, close, volume}]
     */
    setData(data) {
        this.klineData = data;
        this.dates = data.map(item => {
            const date = new Date(item.kline_time || item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
    }

    /**
     * 渲染K线图与均线
     * @param {Object} maData - 移动平均线数据 {ma5, ma10, ma20, ma60}
     */
    renderKline(maData) {
        // 转换K线数据格式 [开盘, 收盘, 最低, 最高]
        const klineValues = this.klineData.map(item => [
            item.open_price,
            item.close_price,
            item.low_price,
            item.high_price
        ]);

        const series = [
            {
                name: 'K线',
                type: 'candlestick',
                data: klineValues,
                itemStyle: {
                    color: '#ef4444',      // 上涨红色
                    color0: '#10b981',     // 下跌绿色
                    borderColor: '#ef4444',
                    borderColor0: '#10b981'
                }
            }
        ];

        // 添加均线
        const maConfig = [
            { period: 5, color: '#FFFFFF', name: 'MA5' },
            { period: 10, color: '#F59E0B', name: 'MA10' },
            { period: 20, color: '#EC4899', name: 'MA20' },
            { period: 60, color: '#8B5CF6', name: 'MA60' }
        ];

        maConfig.forEach(({ period, color, name }) => {
            const maKey = `ma${period}`;
            if (maData[maKey]) {
                series.push({
                    name: name,
                    type: 'line',
                    data: maData[maKey],
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        color: color
                    },
                    showSymbol: false
                });
            }
        });

        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20', 'MA60'],
                textStyle: {
                    color: '#9CA3AF'
                },
                top: 10
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#1F2937'
                    }
                },
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                },
                formatter: (params) => {
                    if (!params || params.length === 0) return '';
                    
                    const dataIndex = params[0].dataIndex;
                    const kline = this.klineData[dataIndex];
                    
                    let html = `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
                        ${this.dates[dataIndex]}
                    </div>`;
                    
                    if (kline) {
                        const change = kline.close_price - kline.open_price;
                        const changePercent = ((change / kline.open_price) * 100).toFixed(2);
                        const changeColor = change >= 0 ? '#ef4444' : '#10b981';
                        
                        html += `
                            <div style="line-height: 1.8;">
                                <span style="color: #9CA3AF;">开盘：</span><span>${kline.open_price.toFixed(2)}</span><br>
                                <span style="color: #9CA3AF;">收盘：</span><span style="color: ${changeColor}; font-weight: bold;">${kline.close_price.toFixed(2)}</span><br>
                                <span style="color: #9CA3AF;">最高：</span><span>${kline.high_price.toFixed(2)}</span><br>
                                <span style="color: #9CA3AF;">最低：</span><span>${kline.low_price.toFixed(2)}</span><br>
                                <span style="color: #9CA3AF;">涨跌：</span><span style="color: ${changeColor};">${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)</span>
                            </div>
                        `;
                    }
                    
                    // 显示均线值
                    params.slice(1).forEach(param => {
                        if (param.value !== null && param.value !== undefined) {
                            html += `<br><span style="color: ${param.color};">● ${param.seriesName}：${param.value.toFixed(2)}</span>`;
                        }
                    });
                    
                    return html;
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '15%',
                bottom: '8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                scale: true,
                boundaryGap: true,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: { show: false }
            },
            yAxis: {
                scale: true,
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(31, 41, 55, 0.05)', 'rgba(17, 24, 39, 0.05)']
                    }
                },
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                },
                {
                    type: 'slider',
                    start: 50,
                    end: 100,
                    height: 20,
                    bottom: 10,
                    textStyle: {
                        color: '#9CA3AF'
                    },
                    borderColor: '#374151',
                    fillerColor: 'rgba(59, 130, 246, 0.3)',
                    handleStyle: {
                        color: '#3B82F6'
                    }
                }
            ],
            series: series
        };

        this.chart.setOption(option, true);
    }

    /**
     * 销毁图表
     */
    dispose() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    /**
     * 响应式调整
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

/**
 * 成交量图渲染器
 */
class VolumeChartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = echarts.init(this.container);
        this.klineData = [];
        this.dates = [];
    }

    setData(data) {
        this.klineData = data;
        this.dates = data.map(item => {
            const date = new Date(item.kline_time || item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
    }

    render() {
        // 成交量数据
        const volumeData = this.klineData.map((item, index) => {
            const isUp = item.close_price >= item.open_price;
            return {
                value: item.volume,
                itemStyle: {
                    color: isUp ? '#ef4444' : '#10b981'
                }
            };
        });

        const option = {
            backgroundColor: 'transparent',
            animation: true,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                },
                formatter: (params) => {
                    if (!params || params.length === 0) return '';
                    const dataIndex = params[0].dataIndex;
                    const kline = this.klineData[dataIndex];
                    const volume = (kline.volume / 100000000).toFixed(2);
                    return `
                        <div style="font-size: 14px;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${this.dates[dataIndex]}</div>
                            <span style="color: #9CA3AF;">成交量：</span><span style="font-weight: bold;">${volume} 亿</span>
                        </div>
                    `;
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '10%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF',
                    formatter: (value) => {
                        return (value / 100000000).toFixed(0) + '亿';
                    }
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: '成交量',
                    type: 'bar',
                    data: volumeData,
                    barMaxWidth: 10
                }
            ]
        };

        this.chart.setOption(option, true);
    }

    dispose() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

/**
 * 技术指标图渲染器
 */
class IndicatorChartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = echarts.init(this.container);
        this.dates = [];
    }

    setDates(dates) {
        this.dates = dates.map(item => {
            const date = new Date(item.kline_time || item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
    }

    /**
     * 渲染 MACD 指标
     */
    renderMACD(macdData) {
        const { dif, dea, macd } = macdData;
        
        const macdBars = macd.map(value => ({
            value: value,
            itemStyle: {
                color: value >= 0 ? '#ef4444' : '#10b981'
            }
        }));

        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['DIF', 'DEA', 'MACD'],
                textStyle: {
                    color: '#9CA3AF'
                },
                top: 5
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '20%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                }
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'DIF',
                    type: 'line',
                    data: dif,
                    lineStyle: {
                        color: '#3B82F6',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: 'DEA',
                    type: 'line',
                    data: dea,
                    lineStyle: {
                        color: '#F59E0B',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: 'MACD',
                    type: 'bar',
                    data: macdBars,
                    barMaxWidth: 8
                }
            ]
        };

        this.chart.setOption(option, true);
    }

    /**
     * 渲染 KDJ 指标
     */
    renderKDJ(kdjData) {
        const { k, d, j } = kdjData;

        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['K', 'D', 'J'],
                textStyle: {
                    color: '#9CA3AF'
                },
                top: 5
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '20%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            visualMap: {
                show: false,
                pieces: [
                    { gt: 0, lte: 20, color: '#10b981' },
                    { gt: 20, lte: 80, color: '#6B7280' },
                    { gt: 80, lte: 100, color: '#ef4444' }
                ],
                outOfRange: {
                    color: '#6B7280'
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'K',
                    type: 'line',
                    data: k,
                    lineStyle: {
                        color: '#3B82F6',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: 'D',
                    type: 'line',
                    data: d,
                    lineStyle: {
                        color: '#F59E0B',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: 'J',
                    type: 'line',
                    data: j,
                    lineStyle: {
                        color: '#EC4899',
                        width: 2
                    },
                    showSymbol: false
                }
            ]
        };

        // 添加超买超卖区域标记
        option.series.push({
            name: '超买线',
            type: 'line',
            data: new Array(this.dates.length).fill(80),
            lineStyle: {
                color: '#ef4444',
                type: 'dashed',
                width: 1,
                opacity: 0.5
            },
            showSymbol: false,
            silent: true
        });

        option.series.push({
            name: '超卖线',
            type: 'line',
            data: new Array(this.dates.length).fill(20),
            lineStyle: {
                color: '#10b981',
                type: 'dashed',
                width: 1,
                opacity: 0.5
            },
            showSymbol: false,
            silent: true
        });

        this.chart.setOption(option, true);
    }

    /**
     * 渲染 RSI 指标
     */
    renderRSI(rsiData) {
        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['RSI(14)'],
                textStyle: {
                    color: '#9CA3AF'
                },
                top: 5
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '20%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'RSI(14)',
                    type: 'line',
                    data: rsiData,
                    lineStyle: {
                        color: '#8B5CF6',
                        width: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                            ]
                        }
                    },
                    showSymbol: false
                },
                {
                    name: '超买线',
                    type: 'line',
                    data: new Array(this.dates.length).fill(70),
                    lineStyle: {
                        color: '#ef4444',
                        type: 'dashed',
                        width: 1,
                        opacity: 0.5
                    },
                    showSymbol: false,
                    silent: true
                },
                {
                    name: '超卖线',
                    type: 'line',
                    data: new Array(this.dates.length).fill(30),
                    lineStyle: {
                        color: '#10b981',
                        type: 'dashed',
                        width: 1,
                        opacity: 0.5
                    },
                    showSymbol: false,
                    silent: true
                }
            ]
        };

        this.chart.setOption(option, true);
    }

    /**
     * 渲染布林带指标
     */
    renderBOLL(bollData, closePrices) {
        const { upper, middle, lower } = bollData;

        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['上轨', '中轨', '下轨', '收盘价'],
                textStyle: {
                    color: '#9CA3AF'
                },
                top: 5
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#374151',
                textStyle: {
                    color: '#E5E7EB'
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                top: '20%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.dates,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                }
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLine: {
                    lineStyle: { color: '#374151' }
                },
                axisLabel: {
                    color: '#9CA3AF'
                },
                splitLine: {
                    lineStyle: { color: '#374151' }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: '上轨',
                    type: 'line',
                    data: upper,
                    lineStyle: {
                        color: '#ef4444',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: '中轨',
                    type: 'line',
                    data: middle,
                    lineStyle: {
                        color: '#F59E0B',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: '下轨',
                    type: 'line',
                    data: lower,
                    lineStyle: {
                        color: '#10b981',
                        width: 2
                    },
                    showSymbol: false
                },
                {
                    name: '收盘价',
                    type: 'line',
                    data: closePrices,
                    lineStyle: {
                        color: '#3B82F6',
                        width: 2
                    },
                    showSymbol: false
                }
            ]
        };

        this.chart.setOption(option, true);
    }

    dispose() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.KlineChartRenderer = KlineChartRenderer;
    window.VolumeChartRenderer = VolumeChartRenderer;
    window.IndicatorChartRenderer = IndicatorChartRenderer;
}
