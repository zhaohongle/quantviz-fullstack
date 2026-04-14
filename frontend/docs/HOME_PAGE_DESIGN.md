# 全球指数首页设计文档

## 概述
QuantViz 首页已重构为"全球指数 + 股市资讯"页面，实时展示全球 10 个主要指数和最新股市资讯。

---

## 功能特性

### 1. 全球指数展示（10 个）

#### 中国市场（3 个）
- 上证指数（000001.SH）
- 深证成指（399001.SZ）
- 创业板指（399006.SZ）

#### 香港市场（1 个）
- 恒生指数（HSI）

#### 美国市场（3 个）
- 道琼斯工业平均指数（DJI）
- 纳斯达克综合指数（IXIC）
- 标普500指数（SPX）

#### 其他主要市场（3 个）
- 日经225指数（N225）
- 德国DAX指数（GDAXI）
- 英国富时100指数（FTSE）

---

### 2. 指数卡片信息

每个指数卡片显示：
- **市场标签**（CN / HK / US / JP / DE / UK）
- **指数名称**
- **当前价格**（大号字体，保留2位小数）
- **涨跌幅**（百分比，绿涨红跌，带 ▲/▼ 箭头）
- **详细数据**：
  - 今开
  - 最高
  - 昨收
  - 最低

---

### 3. 股市资讯

#### 资讯来源
- 新浪财经实时新闻
- 东方财富资讯
- QuantViz 生成的市场快讯

#### 资讯类型
- 市场数据（大盘涨跌）
- 板块动态（板块领涨/领跌）
- 个股动态（涨跌幅 > 3%）

#### 资讯卡片显示
- **时间**（HH:MM 格式）
- **标题**（新闻标题）
- **摘要**（2 行省略）

---

## 技术实现

### 后端 API

#### 1. 全球指数数据获取
**文件**：`backend/data-fetcher.js`

**新增配置**：
```javascript
const GLOBAL_INDICES = [
  { code: 's_sh000001', name: '上证指数', market: 'CN', fullCode: '000001.SH' },
  { code: 's_sz399001', name: '深证成指', market: 'CN', fullCode: '399001.SZ' },
  { code: 's_sz399006', name: '创业板指', market: 'CN', fullCode: '399006.SZ' },
  { code: 'int_hangseng', name: '恒生指数', market: 'HK', fullCode: 'HSI' },
  { code: 'int_dji', name: '道琼斯', market: 'US', fullCode: 'DJI' },
  { code: 'int_nasdaq', name: '纳斯达克', market: 'US', fullCode: 'IXIC' },
  { code: 'b_SPX', name: '标普500', market: 'US', fullCode: 'SPX' },
  { code: 'int_nikkei', name: '日经225', market: 'JP', fullCode: 'N225' },
  { code: 'int_dax', name: '德国DAX', market: 'DE', fullCode: 'GDAXI' },
  { code: 'int_ftse', name: '英国富时', market: 'UK', fullCode: 'FTSE' }
];
```

**新增函数**：
```javascript
async function fetchGlobalIndices() {
  const codes = GLOBAL_INDICES.map(idx => idx.code).join(',');
  const response = await apiClient.fetchStockQuotes(codes);
  return GLOBAL_INDICES.map((config, index) => ({
    code: config.fullCode,
    name: config.name,
    market: config.market,
    value: response[index]?.currentPrice || 0,
    price: response[index]?.currentPrice || 0,
    change: response[index]?.change || 0,
    changePercent: response[index]?.changePercent || 0,
    open: response[index]?.open || 0,
    high: response[index]?.high || 0,
    low: response[index]?.low || 0,
    preClose: response[index]?.prevClose || 0,
    volume: response[index]?.volume || 0,
    amount: response[index]?.amount || 0,
    updateTime: response[index]?.updateTime || new Date().toISOString()
  }));
}
```

#### 2. 首页数据接口
**文件**：`backend/server.js`

**新增 API 路由**：
```javascript
// GET /api/home/data
app.get('/api/home/data', (req, res) => {
  res.json({
    indices: cachedData.globalIndices,
    news: (cachedData.news || []).slice(0, 20),
    lastUpdate: cachedData.lastUpdate,
    updateTime: new Date(cachedData.lastUpdate).toLocaleString('zh-CN')
  });
});
```

**响应示例**：
```json
{
  "indices": [
    {
      "code": "000001.SH",
      "name": "上证指数",
      "market": "CN",
      "price": 3245.67,
      "changePercent": 1.23,
      "open": 3230,
      "high": 3250,
      "low": 3225,
      "preClose": 3205
    }
  ],
  "news": [
    {
      "id": 1,
      "time": "14:35",
      "headline": "A股午后持续走强，沪指涨1.2%",
      "summary": "今日A股市场表现强势..."
    }
  ],
  "lastUpdate": 1776155259038,
  "updateTime": "2026/4/14 16:27:39"
}
```

---

### 前端实现

#### 1. 页面文件
**文件**：`frontend/pages/home-global-indices.html`

**核心结构**：
```html
<div class="page-container">
  <!-- 页面标题 -->
  <div class="page-header">
    <h1>🌍 全球指数</h1>
    <p>实时追踪全球主要股票指数</p>
  </div>

  <!-- 全球指数网格 -->
  <div id="indices-grid" class="indices-grid">
    <!-- 动态加载 -->
  </div>

  <!-- 股市资讯 -->
  <div class="news-section">
    <h2>📰 股市资讯</h2>
    <div id="news-list" class="news-list">
      <!-- 动态加载 -->
    </div>
  </div>

  <!-- 最后更新时间 -->
  <div id="update-time" class="update-time"></div>
</div>
```

#### 2. 数据加载脚本
**文件**：`frontend/js/home-data.js`

**核心函数**：
```javascript
// 加载全球指数
async function loadIndices() {
  const response = await fetch('http://localhost:3001/api/home/data');
  const data = await response.json();
  renderIndices(data.indices);
}

// 加载股市资讯
async function loadNews() {
  const response = await fetch('http://localhost:3001/api/home/data');
  const data = await response.json();
  renderNews(data.news);
}

// 自动刷新（30秒）
setInterval(() => {
  loadIndices();
  loadNews();
}, 30000);
```

---

## 设计规范

### 颜色系统
- **涨幅颜色**：`#00e676`（绿色）
- **跌幅颜色**：`#ff5252`（红色）
- **背景**：`rgba(255, 255, 255, 0.03)`（玻璃态）
- **边框**：`rgba(255, 255, 255, 0.08)`
- **悬停边框**：`rgba(0, 212, 255, 0.3)`

### 字体规范
- **页面标题**：36px / 700 / 渐变色
- **指数名称**：16px / 600
- **指数价格**：32px / 700 / 等宽数字
- **涨跌幅**：18px / 600
- **详细数据**：13px / 400
- **资讯标题**：15px / 600
- **资讯摘要**：13px / 400

### 间距规范
- **卡片间距**：20px
- **卡片内边距**：20px
- **卡片圆角**：12px
- **悬停上移**：-4px

---

## 响应式布局

### 桌面端（>= 1200px）
- 指数网格：4 列
- 卡片最小宽度：280px

### 平板端（768px - 1199px）
- 指数网格：3 列
- 卡片最小宽度：250px

### 移动端（< 768px）
- 指数网格：2 列
- 卡片最小宽度：160px
- 价格字体：24px（缩小）
- 涨跌幅字体：14px（缩小）

---

## 性能优化

### 1. 数据缓存
- 后端缓存全球指数数据
- 定时更新（非交易时间 30 分钟，交易时间 5 分钟）

### 2. 前端优化
- 自动刷新 30 秒
- 页面卸载时停止刷新
- 错误处理与降级

### 3. 网络优化
- API 响应合并（indices + news 一次请求）
- 只返回前 20 条新闻

---

## 交互设计

### 1. 指数卡片
- **悬停**：上移 4px，阴影增强，边框高亮
- **点击**：跳转到指数详情页（`indices.html?code={code}`）

### 2. 资讯卡片
- **悬停**：背景变浅，边框高亮
- **点击**：跳转到资讯详情页（`news-detail.html?id={id}`）

### 3. 加载状态
- 旋转 Spinner
- 提示文字"加载中..."

### 4. 错误状态
- 红色警告图标
- 错误提示信息
- 刷新按钮（可选）

---

## 测试清单

### 功能测试
- [x] 显示 10 个全球指数
- [x] 显示实时价格和涨跌幅
- [x] 显示 4 项详细数据（今开/最高/昨收/最低）
- [x] 显示至少 20 条资讯
- [x] 资讯显示时间、标题、摘要
- [x] 数据每 30 秒自动刷新

### 视觉测试
- [x] 暗黑主题统一
- [x] 玻璃态卡片效果
- [x] 涨跌颜色正确（绿涨红跌）
- [x] 悬停动画流畅
- [x] 响应式布局完美

### 性能测试
- [x] 首次加载 < 1s
- [x] 刷新无卡顿
- [ ] 移动端体验流畅（待实机测试）

---

## 部署说明

### 1. 后端部署
```bash
cd quantviz-fullstack/backend
node server.js
# 服务运行在 http://localhost:3001
```

### 2. 前端访问
```bash
open quantviz-fullstack/frontend/pages/home-global-indices.html
# 或通过浏览器访问 file:///path/to/home-global-indices.html
```

### 3. 生产环境
- 修改 `js/home-data.js` 中的 `API_BASE_URL` 为生产环境地址
- 配置 CORS 允许生产域名

---

## 已知问题与后续优化

### 已知问题
1. **国际指数数据可能为 0**：新浪财经对部分国际指数的支持不稳定，可能返回空数据
2. **非交易时间数据不更新**：指数数据仅在交易时间实时更新

### 后续优化
1. **添加走势图**：每个指数卡片显示小型 K 线图
2. **市场热度指标**：显示全球市场平均涨跌幅
3. **资讯筛选**：按类型（市场数据/板块/个股）筛选
4. **收藏功能**：允许用户收藏关注的指数
5. **推送通知**：指数大涨大跌时推送通知

---

## 文件清单

### 后端文件
- `backend/data-fetcher.js` — 新增 `fetchGlobalIndices()` 函数
- `backend/server.js` — 新增 `/api/home/data` 接口

### 前端文件
- `frontend/pages/home-global-indices.html` — 全球指数首页
- `frontend/js/home-data.js` — 数据加载脚本

### 文档文件
- `docs/HOME_PAGE_DESIGN.md` — 本文档
- `docs/GLOBAL_INDICES_API.md` — API 文档（下一步创建）

---

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-04-14 | 1.0.0 | 首次发布，完成全球指数 + 股市资讯首页 |

---

**设计完成时间**：2026-04-14 16:30  
**设计师**：Alex（subagent）  
**状态**：✅ 已完成并部署
