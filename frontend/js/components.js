// ========== QuantViz UI Components ==========

// Create sparkline SVG
window.createSparkline = function(data, width = 80, height = 28, color = '#00e676') {
  if (!data || data.length === 0) return '';
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Generate points
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  
  // Generate path for filled area
  const pathData = `M0,${height - ((data[0] - min) / range) * (height - 4) - 2} ${points.split(' ').join(' L')} L${width},${height} L0,${height} Z`;
  
  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad-${color}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <path d="${pathData}" fill="url(#grad-${color})"/>
      <polyline fill="none" stroke="${color}" stroke-width="1.5" points="${points}"/>
    </svg>
  `;
};

// Create index card component
window.createIndexCard = function(index) {
  const isUp = index.changePercent >= 0;
  const cardClass = isUp ? 'up-card' : 'down-card';
  const dotColor = isUp ? 'var(--up)' : 'var(--down)';
  const sparklineColor = isUp ? '#00e676' : '#ff5252';
  
  return `
    <div class="glass index-card ${cardClass}" data-code="${index.code}">
      <div class="idx-name">
        <span class="live-dot" style="background: ${dotColor};"></span>
        ${index.name} · ${index.code}
      </div>
      <div class="idx-val">${index.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div>
      <div class="idx-row">
        <span class="idx-chg">${isUp ? '+' : ''}${index.changePercent.toFixed(2)}%</span>
        <span class="idx-pts">${isUp ? '+' : ''}${index.change.toFixed(2)}</span>
      </div>
      <div class="idx-range">
        <span>高 ${index.high.toFixed(2)}</span>
        <span>低 ${index.low.toFixed(2)}</span>
      </div>
      <div class="sparkline-wrap">
        ${createSparkline(index.sparkline, 200, 44, sparklineColor)}
      </div>
    </div>
  `;
};

// Create ranking row
window.createRankRow = function(stock, rank) {
  const isUp = stock.changePercent >= 0;
  const isLimit = Math.abs(stock.changePercent) >= 9.9;
  const rowClass = isUp ? 'rank-up' : 'rank-down';
  const limitClass = isLimit ? (isUp ? 'limit-up' : 'limit-down') : '';
  
  return `
    <div class="rank-row ${rowClass} ${limitClass}" data-code="${stock.code}">
      <span class="rank-num">${rank}</span>
      <span class="rank-code">${stock.code}</span>
      <span class="rank-name">${stock.name}</span>
      <span class="rank-price">${stock.price.toFixed(2)}</span>
      <span class="rank-chg">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
    </div>
  `;
};

// Create watchlist row
window.createWatchlistRow = function(stock) {
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;
  const isLimit = Math.abs(stock.changePercent) >= 9.9;
  
  let chgClass = '';
  if (isLimit && isUp) chgClass = 'limit-up';
  else if (isLimit && isDown) chgClass = 'limit-down';
  else if (isUp) chgClass = 'up';
  else if (isDown) chgClass = 'down';
  
  const priceColor = isUp ? 'color-up' : (isDown ? 'color-down' : '');
  const sparklineColor = isUp ? '#00e676' : (isDown ? '#ff5252' : '#8b949e');
  
  return `
    <div class="wl-row" data-code="${stock.code}">
      <span class="wl-drag">⋮⋮</span>
      <span class="wl-code">${stock.code}</span>
      <span class="wl-name">${stock.name}</span>
      <span class="wl-price ${priceColor}">${stock.price.toFixed(2)}</span>
      <span><span class="wl-chg ${chgClass}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span></span>
      <span class="${priceColor}" style="font-family:var(--mono);font-size:12px;">${isUp ? '+' : ''}${stock.change.toFixed(2)}</span>
      <span class="wl-vol">${(stock.volume / 10000).toFixed(1)}万手</span>
      <span class="wl-amount">${(stock.amount / 100000000).toFixed(0)}亿</span>
      <span class="wl-spark">
        ${createSparkline(stock.sparkline, 80, 28, sparklineColor)}
      </span>
      <button class="wl-del" onclick="removeFromWatchlist('${stock.code}')">✕</button>
    </div>
  `;
};

// Create news item
window.createNewsItem = function(news, isFirst = false) {
  const badgeClasses = {
    'urgent': 'badge-urgent',
    'important': 'badge-important',
    'normal': 'badge-normal'
  };
  
  const badgeClass = badgeClasses[news.badge] || 'badge-normal';
  const latestClass = news.latest ? 'latest' : '';
  const selectedClass = news.selected ? 'selected' : '';
  
  const stockTags = news.stocks && news.stocks.length > 0
    ? news.stocks.map(code => {
        const stock = window.getStockByCode(code);
        if (!stock) return '';
        return `<span class="news-stock-tag" onclick="navigateToStock('${code}')">${code} ${stock.name}</span>`;
      }).join('')
    : '';
  
  return `
    <div class="news-item glass ${latestClass} ${selectedClass}" data-id="${news.id}" onclick="selectNews(${news.id})">
      <div class="news-time">
        ${news.time} <span class="news-badge ${badgeClass}">${news.badgeText}</span>
      </div>
      <div class="news-headline">${news.headline}</div>
      <div class="news-summary">${news.summary}</div>
      <div class="news-meta">
        <span class="news-source">${news.source}</span>
        <div class="news-tags">${stockTags}</div>
      </div>
    </div>
  `;
};

// Create news detail panel
window.createNewsDetail = function(news) {
  if (!news) return '<div class="detail-card"><p>选择一条新闻查看详情</p></div>';
  
  const relatedStocks = news.stocks && news.stocks.length > 0
    ? news.stocks.map(code => {
        const stock = window.getStockByCode(code);
        if (!stock) return '';
        const isUp = stock.changePercent >= 0;
        const colorClass = isUp ? 'color-up' : 'color-down';
        return `
          <div class="related-stock" onclick="navigateToStock('${code}')">
            <span class="rs-code">${code}</span>
            <span class="rs-name">${stock.name}</span>
            <span class="rs-price ${colorClass}">${stock.price.toFixed(2)}</span>
            <span class="rs-chg ${colorClass}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
          </div>
        `;
      }).join('')
    : '';
  
  return `
    <div class="detail-card">
      <div class="detail-label">快讯详情</div>
      <div class="detail-headline">${news.headline}</div>
      <div class="detail-meta">
        <span>📰 ${news.source}</span>
        <span>🕐 ${news.datetime}</span>
      </div>
      <div class="detail-body">
        ${news.content || `<p>${news.summary}</p>`}
      </div>
      ${relatedStocks ? `
        <div class="detail-related">
          <h4>📈 关联股票</h4>
          ${relatedStocks}
        </div>
      ` : ''}
    </div>
  `;
};

// Create sector bubble
window.createSectorBubbles = function(sectors) {
  const container = document.querySelector('.bubble-area');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Position bubbles in a force-directed layout simulation
  const width = container.clientWidth;
  const height = container.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  
  sectors.forEach((sector, idx) => {
    const angle = (idx / sectors.length) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.3;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Size based on flow magnitude
    const flowMagnitude = Math.abs(sector.flow);
    const maxFlow = Math.max(...sectors.map(s => Math.abs(s.flow)));
    const size = 60 + (flowMagnitude / maxFlow) * 80;
    
    const isPositive = sector.flow >= 0;
    const color = isPositive ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)';
    const borderColor = isPositive ? '#00e676' : '#ff5252';
    const textColor = isPositive ? '#00e676' : '#ff5252';
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${x - size / 2}px`;
    bubble.style.top = `${y - size / 2}px`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.background = color;
    bubble.style.border = `2px solid ${borderColor}`;
    bubble.style.color = textColor;
    
    bubble.innerHTML = `
      <div class="b-name">${sector.name}</div>
      <div class="b-val">${isPositive ? '+' : ''}${(sector.flow / 100000000).toFixed(1)}亿</div>
    `;
    
    bubble.style.cursor = 'pointer';
    bubble.addEventListener('click', function() { window.location.hash = '#/sector/' + encodeURIComponent(sector.name); });
    
    container.appendChild(bubble);
  });
};

// Create marquee ticker
window.createMarqueeTicker = function(news) {
  const items = news.slice(0, 10).map(item => `
    <div class="marquee-item" onclick="selectNews(${item.id})">
      <span class="dot"></span>
      <span class="time">${item.time}</span>
      ${item.headline}
    </div>
  `).join('');
  
  // Duplicate for seamless loop
  return items + items;
};

// Create search results
window.createSearchResults = function(query) {
  if (!query || query.length < 1) return '';
  
  const results = window.MOCK_STOCKS
    .filter(stock => {
      const q = query.toLowerCase();
      return stock.code.includes(q) || 
             stock.name.toLowerCase().includes(q) ||
             (stock.name.split('').map(c => c[0]).join('').toLowerCase().includes(q));
    })
    .slice(0, 8);
  
  if (results.length === 0) {
    return '<div style="padding: 16px; text-align: center; color: var(--text-sec);">未找到相关股票</div>';
  }
  
  return results.map(stock => {
    const isUp = stock.changePercent >= 0;
    const priceColor = isUp ? 'color-up' : 'color-down';
    return `
      <div class="search-item" onclick="navigateToStock('${stock.code}')">
        <span class="code">${stock.code}</span>
        <span class="name">${stock.name}</span>
        <span class="price ${priceColor}">${stock.price.toFixed(2)}</span>
        <span class="chg ${priceColor}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
      </div>
    `;
  }).join('');
};

// Format number with units
window.formatNumber = function(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(0);
};

// Format money
window.formatMoney = function(num) {
  if (num >= 1000000000000) {
    return (num / 100000000).toLocaleString('zh-CN', {maximumFractionDigits: 0}) + '亿';
  } else if (num >= 100000000) {
    return (num / 100000000).toFixed(0) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString('zh-CN', {maximumFractionDigits: 0});
};

// Sector list view (alternative to bubbles)
window.createSectorList = function(sectors) {
  const sorted = [...sectors].sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow));
  return `<div style="padding:0 4px;">
    ${sorted.map(sector => {
      const isPos = sector.flow >= 0;
      const color = isPos ? 'var(--up)' : 'var(--down)';
      const barWidth = (Math.abs(sector.flow) / Math.max(...sectors.map(s => Math.abs(s.flow)))) * 100;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid rgba(48,54,61,0.15);cursor:pointer;transition:background .12s;" onmouseover="this.style.background='rgba(0,212,255,0.03)'" onmouseout="this.style.background='transparent'" onclick="window.location.hash='#/sector/${encodeURIComponent(sector.name)}'">
        <span style="width:60px;font-size:13px;font-weight:500;">${sector.name}</span>
        <div style="flex:1;height:18px;background:rgba(48,54,61,0.15);border-radius:3px;overflow:hidden;">
          <div style="width:${barWidth}%;height:100%;background:${isPos ? 'rgba(0,230,118,0.25)' : 'rgba(255,82,82,0.25)'};border-radius:3px;transition:width .3s;"></div>
        </div>
        <span style="font-family:var(--mono);font-size:12px;color:${color};min-width:60px;text-align:right;font-weight:600;">${isPos ? '+' : ''}${(sector.flow / 100000000).toFixed(1)}亿</span>
        <span style="font-family:var(--mono);font-size:11px;color:${color};min-width:50px;text-align:right;">${isPos ? '+' : ''}${sector.changePercent.toFixed(2)}%</span>
      </div>`;
    }).join('')}
  </div>`;
};

// Improved search results with add-to-watchlist button
window.createSearchResults = function(query) {
  if (!query || query.length < 1) return '';

  const results = window.MOCK_STOCKS
    .filter(stock => {
      const q = query.toLowerCase();
      return stock.code.includes(q) ||
             stock.name.toLowerCase().includes(q);
    })
    .slice(0, 8);

  if (results.length === 0) {
    return '<div style="padding:16px;text-align:center;color:var(--text-sec);">未找到相关股票</div>';
  }

  return results.map(stock => {
    const isUp = stock.changePercent >= 0;
    const priceColor = isUp ? 'color-up' : 'color-down';
    const inWatchlist = window.APP_STATE && window.APP_STATE.watchlist.includes(stock.code);
    return `
      <div class="search-item" onclick="navigateToStock('${stock.code}')">
        <span class="code">${stock.code}</span>
        <span class="name">${stock.name}</span>
        <span class="price ${priceColor}">${stock.price.toFixed(2)}</span>
        <span class="chg ${priceColor}">${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
        <span style="font-size:14px;cursor:pointer;margin-left:4px;" onclick="event.stopPropagation(); ${inWatchlist ? "showToast('已在自选中')" : "addToWatchlist('" + stock.code + "')"}" title="${inWatchlist ? '已在自选' : '加入自选'}">${inWatchlist ? '⭐' : '☆'}</span>
      </div>
    `;
  }).join('');
};
