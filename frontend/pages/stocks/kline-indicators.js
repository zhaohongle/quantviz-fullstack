// ========================================
// 技术指标计算引擎
// ========================================

/**
 * 计算 EMA（指数移动平均线）
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期
 * @returns {Array<number>}
 */
function calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // 第一个值使用 SMA
    let sum = 0;
    for (let i = 0; i < period && i < data.length; i++) {
        sum += data[i];
    }
    ema[period - 1] = sum / period;
    
    // 后续值使用 EMA 公式
    for (let i = period; i < data.length; i++) {
        ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    return ema;
}

/**
 * 计算 SMA（简单移动平均线）
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期
 * @returns {Array<number>}
 */
function calculateSMA(data, period) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
            continue;
        }
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j];
        }
        sma.push(sum / period);
    }
    return sma;
}

/**
 * 计算 MACD 指标
 * @param {Array<number>} closePrices - 收盘价数组
 * @param {number} fastPeriod - 快线周期（默认12）
 * @param {number} slowPeriod - 慢线周期（默认26）
 * @param {number} signalPeriod - 信号线周期（默认9）
 * @returns {Object} { dif, dea, macd }
 */
function calculateMACD(closePrices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = calculateEMA(closePrices, fastPeriod);
    const emaSlow = calculateEMA(closePrices, slowPeriod);
    
    // DIF = EMA(12) - EMA(26)
    const dif = emaFast.map((fast, i) => {
        if (fast == null || emaSlow[i] == null) return null;
        return fast - emaSlow[i];
    });
    
    // DEA = EMA(DIF, 9)
    const validDif = dif.filter(v => v !== null);
    const deaValues = calculateEMA(validDif, signalPeriod);
    
    // 补齐 DEA 数组长度
    const dea = new Array(dif.length).fill(null);
    let deaIndex = 0;
    for (let i = 0; i < dif.length; i++) {
        if (dif[i] !== null && deaIndex < deaValues.length) {
            dea[i] = deaValues[deaIndex++];
        }
    }
    
    // MACD = 2 * (DIF - DEA)
    const macd = dif.map((d, i) => {
        if (d == null || dea[i] == null) return null;
        return 2 * (d - dea[i]);
    });
    
    return { dif, dea, macd };
}

/**
 * 计算 KDJ 指标
 * @param {Array<Object>} klineData - K线数据 [{high, low, close}]
 * @param {number} period - 周期（默认9）
 * @param {number} m1 - K值平滑因子（默认3）
 * @param {number} m2 - D值平滑因子（默认3）
 * @returns {Object} { k, d, j }
 */
function calculateKDJ(klineData, period = 9, m1 = 3, m2 = 3) {
    const rsv = [];
    const k = [];
    const d = [];
    const j = [];
    
    for (let i = 0; i < klineData.length; i++) {
        if (i < period - 1) {
            rsv.push(null);
            k.push(null);
            d.push(null);
            j.push(null);
            continue;
        }
        
        // 计算 N 日内的最高价和最低价
        let highest = -Infinity;
        let lowest = Infinity;
        for (let j = 0; j < period; j++) {
            const idx = i - j;
            highest = Math.max(highest, klineData[idx].high);
            lowest = Math.min(lowest, klineData[idx].low);
        }
        
        // RSV = (收盘价 - 最低价) / (最高价 - 最低价) * 100
        const currentRSV = highest === lowest ? 50 : 
            ((klineData[i].close - lowest) / (highest - lowest)) * 100;
        rsv.push(currentRSV);
        
        // K = (2/3 * 前K值) + (1/3 * 当前RSV)
        const prevK = i === period - 1 ? 50 : k[i - 1];
        const currentK = (2 / m1) * prevK + (1 / m1) * currentRSV;
        k.push(currentK);
        
        // D = (2/3 * 前D值) + (1/3 * 当前K值)
        const prevD = i === period - 1 ? 50 : d[i - 1];
        const currentD = (2 / m2) * prevD + (1 / m2) * currentK;
        d.push(currentD);
        
        // J = 3K - 2D
        const currentJ = 3 * currentK - 2 * currentD;
        j.push(currentJ);
    }
    
    return { k, d, j };
}

/**
 * 计算 RSI 指标
 * @param {Array<number>} closePrices - 收盘价数组
 * @param {number} period - 周期（默认14）
 * @returns {Array<number>}
 */
function calculateRSI(closePrices, period = 14) {
    const rsi = [];
    let gainSum = 0;
    let lossSum = 0;
    
    // 计算初始平均涨跌幅
    for (let i = 1; i <= period; i++) {
        const change = closePrices[i] - closePrices[i - 1];
        if (change > 0) {
            gainSum += change;
        } else {
            lossSum += Math.abs(change);
        }
    }
    
    let avgGain = gainSum / period;
    let avgLoss = lossSum / period;
    
    // 前面的值设为 null
    for (let i = 0; i <= period; i++) {
        rsi.push(null);
    }
    
    // 计算 RSI
    rsi[period] = 100 - (100 / (1 + avgGain / avgLoss));
    
    for (let i = period + 1; i < closePrices.length; i++) {
        const change = closePrices[i] - closePrices[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        
        rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
    }
    
    return rsi;
}

/**
 * 计算布林带指标
 * @param {Array<number>} closePrices - 收盘价数组
 * @param {number} period - 周期（默认20）
 * @param {number} stdDev - 标准差倍数（默认2）
 * @returns {Object} { upper, middle, lower }
 */
function calculateBOLL(closePrices, period = 20, stdDev = 2) {
    const middle = calculateSMA(closePrices, period);
    const upper = [];
    const lower = [];
    
    for (let i = 0; i < closePrices.length; i++) {
        if (middle[i] === null) {
            upper.push(null);
            lower.push(null);
            continue;
        }
        
        // 计算标准差
        let sum = 0;
        for (let j = 0; j < period; j++) {
            const diff = closePrices[i - j] - middle[i];
            sum += diff * diff;
        }
        const sd = Math.sqrt(sum / period);
        
        upper.push(middle[i] + stdDev * sd);
        lower.push(middle[i] - stdDev * sd);
    }
    
    return { upper, middle, lower };
}

/**
 * 计算多条移动平均线
 * @param {Array<number>} closePrices - 收盘价数组
 * @param {Array<number>} periods - 周期数组 [5, 10, 20, 60]
 * @returns {Object} { ma5, ma10, ma20, ma60 }
 */
function calculateMultipleMA(closePrices, periods = [5, 10, 20, 60]) {
    const result = {};
    periods.forEach(period => {
        result[`ma${period}`] = calculateSMA(closePrices, period);
    });
    return result;
}

// 导出函数（浏览器环境）
if (typeof window !== 'undefined') {
    window.TechnicalIndicators = {
        calculateEMA,
        calculateSMA,
        calculateMACD,
        calculateKDJ,
        calculateRSI,
        calculateBOLL,
        calculateMultipleMA
    };
}
