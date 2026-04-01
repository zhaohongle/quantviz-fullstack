// ========== QuantViz ECharts Configuration ==========

// Get chart theme based on current theme
function getChartTheme() {
  const isDark = !document.body.classList.contains('light-theme');
  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#e6edf3' : '#1f2937'
    },
    gridColor: isDark ? 'rgba(48,54,61,0.3)' : 'rgba(229,231,235,0.5)',
    upColor: isDark ? '#00e676' : '#52c41a',
    downColor: isDark ? '#ff5252' : '#f5222d',
    borderColor: isDark ? 'rgba(48,54,61,0.5)' : '#e5e7eb'
  };
}

// Create K-line chart
window.createKLineChart = function(containerId, data, title = '日K线') {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) return null;

  const chart = echarts.init(container);
  const theme = getChartTheme();

  // Process data
  const dates = data.map(item => item.date);
  const ohlc = data.map(item => [item.open, item.close, item.low, item.high]);
  const volumes = data.map(item => item.volume);

  // Calculate MA lines
  function calculateMA(dayCount) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < dayCount - 1) {
        result.push('-');
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data[i - j].close;
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }

  const ma5 = calculateMA(5);
  const ma10 = calculateMA(10);
  const ma20 = calculateMA(20);
  const ma60 = calculateMA(60);

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: theme.upColor,
          opacity: 0.3
        }
      },
      backgroundColor: 'rgba(10,14,23,0.92)',
      borderColor: theme.borderColor,
      textStyle: {
        color: theme.textStyle.color,
        fontSize: 12
      },
      formatter: function(params) {
        const dataIndex = params[0].dataIndex;
        const item = data[dataIndex];
        return `
          <div style="font-family: 'JetBrains Mono', monospace;">
            <div style="margin-bottom: 4px; color: #8b949e;">${item.date}</div>
            <div>开 ${item.open.toFixed(2)} </div>
            <div>高 <span style="color: ${theme.upColor};">${item.high.toFixed(2)}</span></div>
            <div>低 ${item.low.toFixed(2)}</div>
            <div>收 <span style="color: ${item.close >= item.open ? theme.upColor : theme.downColor};">${item.close.toFixed(2)}</span></div>
            <div>量 ${(item.volume / 100000000).toFixed(2)}亿</div>
          </div>
        `;
      }
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }]
    },
    grid: [
      {
        left: '3%',
        right: '3%',
        top: '8%',
        height: '65%'
      },
      {
        left: '3%',
        right: '3%',
        top: '78%',
        height: '15%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: true,
        axisLine: { lineStyle: { color: theme.gridColor } },
        axisLabel: {
          color: theme.textStyle.color,
          fontSize: 10,
          formatter: function(value) {
            return value.substring(5);
          }
        },
        splitLine: { show: false },
        axisTick: { show: false },
        gridIndex: 0
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: true,
        axisLine: { lineStyle: { color: theme.gridColor } },
        axisLabel: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        gridIndex: 0,
        splitLine: {
          lineStyle: { color: theme.gridColor, width: 0.5 }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: theme.textStyle.color,
          fontSize: 10,
          formatter: '{value}'
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 50,
        end: 100
      },
      {
        show: false,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: 10,
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: theme.upColor,
          color0: theme.downColor,
          borderColor: theme.upColor,
          borderColor0: theme.downColor
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.8,
          width: 1.5,
          color: '#f5a623'
        },
        xAxisIndex: 0,
        yAxisIndex: 0
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.8,
          width: 1.5,
          color: '#4a90d9'
        },
        xAxisIndex: 0,
        yAxisIndex: 0
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.7,
          width: 1.5,
          color: '#9b59b6'
        },
        xAxisIndex: 0,
        yAxisIndex: 0
      },
      {
        name: 'MA60',
        type: 'line',
        data: ma60,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.6,
          width: 1.5,
          color: '#66bb6a'
        },
        xAxisIndex: 0,
        yAxisIndex: 0
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes.map((vol, idx) => ({
          value: vol,
          itemStyle: {
            color: data[idx].close >= data[idx].open ? theme.upColor : theme.downColor,
            opacity: 0.6
          }
        }))
      }
    ]
  };

  chart.setOption(option);
  
  // Resize on window resize
  window.addEventListener('resize', () => {
    chart.resize();
  });

  return chart;
};

// Create MACD chart
window.createMACDChart = function(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) return null;

  const chart = echarts.init(container);
  const theme = getChartTheme();

  // Calculate MACD
  function calculateMACD(data, short = 12, long = 26, signal = 9) {
    const closes = data.map(d => d.close);
    const ema12 = [];
    const ema26 = [];
    const dif = [];
    const dea = [];
    const macd = [];

    // Calculate EMA12
    let multiplier12 = 2 / (short + 1);
    ema12[0] = closes[0];
    for (let i = 1; i < closes.length; i++) {
      ema12[i] = (closes[i] - ema12[i - 1]) * multiplier12 + ema12[i - 1];
    }

    // Calculate EMA26
    let multiplier26 = 2 / (long + 1);
    ema26[0] = closes[0];
    for (let i = 1; i < closes.length; i++) {
      ema26[i] = (closes[i] - ema26[i - 1]) * multiplier26 + ema26[i - 1];
    }

    // Calculate DIF
    for (let i = 0; i < closes.length; i++) {
      dif[i] = ema12[i] - ema26[i];
    }

    // Calculate DEA
    let multiplierSignal = 2 / (signal + 1);
    dea[0] = dif[0];
    for (let i = 1; i < dif.length; i++) {
      dea[i] = (dif[i] - dea[i - 1]) * multiplierSignal + dea[i - 1];
    }

    // Calculate MACD histogram
    for (let i = 0; i < dif.length; i++) {
      macd[i] = (dif[i] - dea[i]) * 2;
    }

    return { dif, dea, macd };
  }

  const macdData = calculateMACD(data);
  const dates = data.map(item => item.date);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: theme.gridColor } },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      scale: true,
      splitLine: {
        lineStyle: { color: theme.gridColor, width: 0.5 }
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textStyle.color,
        fontSize: 9
      }
    },
    series: [
      {
        name: 'MACD',
        type: 'bar',
        data: macdData.macd.map(val => ({
          value: val.toFixed(2),
          itemStyle: {
            color: val >= 0 ? theme.upColor : theme.downColor
          }
        })),
        barWidth: '60%'
      },
      {
        name: 'DIF',
        type: 'line',
        data: macdData.dif.map(v => v.toFixed(2)),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#4a90d9',
          width: 1.5,
          opacity: 0.9
        }
      },
      {
        name: 'DEA',
        type: 'line',
        data: macdData.dea.map(v => v.toFixed(2)),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#f5a623',
          width: 1.5,
          opacity: 0.9
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,23,0.92)',
      borderColor: theme.borderColor,
      textStyle: {
        color: theme.textStyle.color,
        fontSize: 11
      }
    }
  };

  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });

  return chart;
};

// Create KDJ chart
window.createKDJChart = function(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container || !data || data.length === 0) return null;

  const chart = echarts.init(container);
  const theme = getChartTheme();

  // Calculate KDJ
  function calculateKDJ(data, period = 9) {
    const k = [];
    const d = [];
    const j = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        k.push(50);
        d.push(50);
        j.push(50);
        continue;
      }

      let highMax = -Infinity;
      let lowMin = Infinity;

      for (let p = 0; p < period; p++) {
        highMax = Math.max(highMax, data[i - p].high);
        lowMin = Math.min(lowMin, data[i - p].low);
      }

      const rsv = ((data[i].close - lowMin) / (highMax - lowMin)) * 100;
      const kVal = i === period - 1 ? 50 : k[i - 1] * (2 / 3) + rsv * (1 / 3);
      const dVal = i === period - 1 ? 50 : d[i - 1] * (2 / 3) + kVal * (1 / 3);
      const jVal = 3 * kVal - 2 * dVal;

      k.push(kVal);
      d.push(dVal);
      j.push(jVal);
    }

    return { k, d, j };
  }

  const kdjData = calculateKDJ(data);
  const dates = data.map(item => item.date);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: theme.gridColor } },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: { color: theme.gridColor, width: 0.5 }
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textStyle.color,
        fontSize: 9
      }
    },
    series: [
      {
        name: 'K',
        type: 'line',
        data: kdjData.k.map(v => v.toFixed(2)),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#4a90d9',
          width: 1.5,
          opacity: 0.9
        }
      },
      {
        name: 'D',
        type: 'line',
        data: kdjData.d.map(v => v.toFixed(2)),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#f5a623',
          width: 1.5,
          opacity: 0.9
        }
      },
      {
        name: 'J',
        type: 'line',
        data: kdjData.j.map(v => v.toFixed(2)),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#9b59b6',
          width: 1.2,
          opacity: 0.8
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,23,0.92)',
      borderColor: theme.borderColor,
      textStyle: {
        color: theme.textStyle.color,
        fontSize: 11
      }
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 80, color: theme.downColor },
        { lte: 20, color: theme.upColor }
      ],
      outOfRange: {
        color: '#999'
      }
    }
  };

  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });

  return chart;
};

console.log('📊 ECharts configurations loaded');
