# 全球指数 API 文档

## 概述
QuantViz 后端提供全球指数数据 API，支持实时获取 10 个全球主要指数的行情数据。

---

## API 基础信息

### Base URL
```
开发环境：http://localhost:3001
生产环境：https://api.quantviz.com（待配置）
```

### 请求头
```http
Content-Type: application/json
```

### 响应格式
所有响应均为 JSON 格式。

---

## 接口列表

### 1. 获取首页数据（全球指数 + 股市资讯）

#### 请求
```http
GET /api/home/data
```

#### 响应示例
```json
{
  "indices": [
    {
      "code": "000001.SH",
      "name": "上证指数",
      "market": "CN",
      "value": 3245.67,
      "price": 3245.67,
      "change": 39.62,
      "changePercent": 1.23,
      "open": 3230.00,
      "high": 3250.00,
      "low": 3225.00,
      "preClose": 3206.05,
      "volume": 250000000,
      "amount": 9984,
      "updateTime": "2026-04-14T08:30:00.000Z"
    },
    {
      "code": "399001.SZ",
      "name": "深证成指",
      "market": "CN",
      "value": 10234.56,
      "price": 10234.56,
      "change": 102.34,
      "changePercent": 1.01,
      "open": 10180.00,
      "high": 10250.00,
      "low": 10150.00,
      "preClose": 10132.22,
      "volume": 180000000,
      "amount": 7856,
      "updateTime": "2026-04-14T08:30:00.000Z"
    }
  ],
  "news": [
    {
      "id": 1,
      "time": "14:35",
      "datetime": "2026-04-14T06:35:00.000Z",
      "badge": "urgent",
      "badgeText": "重大",
      "headline": "上证指数上涨1.23%，报3245.67点",
      "summary": "上证指数收涨1.23%，成交额9984亿元。",
      "content": "<p>上证指数收涨1.23%，报3245.67点，成交额9984亿元。</p>",
      "source": "QuantViz 实时",
      "category": "市场数据",
      "stocks": [],
      "latest": true,
      "selected": true
    },
    {
      "id": 2,
      "time": "14:20",
      "datetime": "2026-04-14T06:20:00.000Z",
      "badge": "important",
      "badgeText": "重要",
      "headline": "白酒板块领涨，贵州茅台表现突出",
      "summary": "白酒板块表现强势，平均涨幅2.34%。",
      "source": "QuantViz 实时",
      "category": "行业动态",
      "stocks": []
    }
  ],
  "lastUpdate": 1776155259038,
  "updateTime": "2026/4/14 16:27:39"
}
```

#### 响应字段说明

##### indices 数组（指数数据）
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| code | string | 指数代码 | "000001.SH" |
| name | string | 指数名称 | "上证指数" |
| market | string | 市场标识 | "CN" / "HK" / "US" / "JP" / "DE" / "UK" |
| value | number | 指数当前值 | 3245.67 |
| price | number | 指数当前值（同 value） | 3245.67 |
| change | number | 涨跌点数 | 39.62 |
| changePercent | number | 涨跌幅百分比 | 1.23 |
| open | number | 今日开盘价 | 3230.00 |
| high | number | 今日最高价 | 3250.00 |
| low | number | 今日最低价 | 3225.00 |
| preClose | number | 昨日收盘价 | 3206.05 |
| volume | number | 成交量（股） | 250000000 |
| amount | number | 成交额（亿元） | 9984 |
| updateTime | string | 更新时间（ISO 格式） | "2026-04-14T08:30:00.000Z" |

##### news 数组（资讯数据）
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | number | 资讯 ID | 1 |
| time | string | 发布时间（HH:MM） | "14:35" |
| datetime | string | 发布时间（ISO 格式） | "2026-04-14T06:35:00.000Z" |
| badge | string | 徽章类型 | "urgent" / "important" / "flash" |
| badgeText | string | 徽章文字 | "重大" / "重要" / "快讯" |
| headline | string | 新闻标题 | "上证指数上涨1.23%..." |
| summary | string | 新闻摘要 | "上证指数收涨1.23%..." |
| content | string | 新闻内容（HTML） | "<p>...</p>" |
| source | string | 新闻来源 | "QuantViz 实时" |
| category | string | 新闻分类 | "市场数据" / "行业动态" / "个股动态" |
| stocks | array | 相关股票代码 | ["600519"] |

##### 元数据字段
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| lastUpdate | number | 最后更新时间戳（毫秒） | 1776155259038 |
| updateTime | string | 最后更新时间（本地化） | "2026/4/14 16:27:39" |

---

### 2. 获取所有数据（完整数据集）

#### 请求
```http
GET /api/data
```

#### 响应示例
```json
{
  "indices": [...],        // 国内指数（4个）
  "stocks": [...],         // 股票数据（20只）
  "sectors": [...],        // 板块数据
  "news": [...],           // 新闻（所有）
  "recommendations": [...], // 推荐股票
  "ranking": {             // 排行榜
    "gainers": [...],
    "losers": [...]
  },
  "lastUpdate": 1776155259038,
  "updateTime": "2026/4/14 16:27:39"
}
```

#### 说明
此接口返回完整数据集，包含国内指数、股票、板块、新闻、推荐等。适用于非首页的其他页面。

---

### 3. 获取指数数据（仅指数）

#### 请求
```http
GET /api/indices
```

#### 响应示例
```json
{
  "data": [
    {
      "code": "000001.SH",
      "name": "上证指数",
      "value": 3245.67,
      "changePercent": 1.23,
      "amount": 9984
    }
  ],
  "lastUpdate": 1776155259038
}
```

#### 说明
此接口仅返回国内 4 个指数（上证、深证、创业板、恒生）。如需全球指数，使用 `/api/home/data`。

---

### 4. 获取新闻数据（仅新闻）

#### 请求
```http
GET /api/news
```

#### 响应示例
```json
{
  "data": [
    {
      "id": 1,
      "time": "14:35",
      "headline": "上证指数上涨1.23%...",
      "summary": "..."
    }
  ],
  "lastUpdate": 1776155259038
}
```

#### 说明
此接口返回所有新闻数据（不限数量）。首页使用 `/api/home/data` 已自动限制为前 20 条。

---

## 错误处理

### HTTP 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 503 | 数据加载中，请稍后重试 |
| 500 | 服务器内部错误 |

### 错误响应示例
```json
{
  "error": "数据加载中，请稍后重试"
}
```

---

## 数据更新频率

### 交易时间（周一至周五 9:30 - 15:00）
- 更新频率：**每 5 分钟**
- 数据源：新浪财经实时 API

### 非交易时间
- 更新频率：**每 30 分钟**
- 数据源：缓存数据

### 手动触发更新
```http
POST /api/refresh
```

响应：
```json
{
  "success": true,
  "message": "数据更新成功",
  "lastUpdate": 1776155259038
}
```

---

## 全球指数列表

| 代码 | 名称 | 市场 | 新浪财经代码 |
|------|------|------|--------------|
| 000001.SH | 上证指数 | CN | s_sh000001 |
| 399001.SZ | 深证成指 | CN | s_sz399001 |
| 399006.SZ | 创业板指 | CN | s_sz399006 |
| HSI | 恒生指数 | HK | int_hangseng |
| DJI | 道琼斯 | US | int_dji |
| IXIC | 纳斯达克 | US | int_nasdaq |
| SPX | 标普500 | US | b_SPX |
| N225 | 日经225 | JP | int_nikkei |
| GDAXI | 德国DAX | DE | int_dax |
| FTSE | 英国富时 | UK | int_ftse |

---

## 使用示例

### JavaScript Fetch
```javascript
async function loadGlobalIndices() {
  const response = await fetch('http://localhost:3001/api/home/data');
  const data = await response.json();
  console.log('全球指数:', data.indices);
  console.log('股市资讯:', data.news);
}

loadGlobalIndices();
```

### cURL
```bash
curl http://localhost:3001/api/home/data
```

### Python
```python
import requests

response = requests.get('http://localhost:3001/api/home/data')
data = response.json()

print('全球指数:', data['indices'])
print('股市资讯:', data['news'])
```

---

## 性能优化建议

### 1. 客户端缓存
```javascript
// 缓存 30 秒
const CACHE_TTL = 30000;
let cache = { data: null, timestamp: 0 };

async function loadData() {
  if (Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data; // 使用缓存
  }
  
  const response = await fetch('/api/home/data');
  const data = await response.json();
  
  cache = { data, timestamp: Date.now() };
  return data;
}
```

### 2. 请求合并
首页使用 `/api/home/data` 一次性获取指数和新闻，避免多次请求。

### 3. 按需加载
如果只需要指数数据，使用 `/api/indices` 减少数据传输量。

---

## 安全说明

### CORS 配置
后端已启用 CORS，允许跨域请求。生产环境建议限制允许的域名：

```javascript
// backend/server.js
app.use(cors({
  origin: ['https://quantviz.com', 'https://app.quantviz.com']
}));
```

### XSS 防护
前端渲染新闻内容时已进行 HTML 转义（`escapeHtml()` 函数）。

---

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-04-14 | 1.0.0 | 首次发布，完成全球指数 API 文档 |

---

**API 文档完成时间**：2026-04-14 16:35  
**文档作者**：Alex（subagent）  
**状态**：✅ 已完成
