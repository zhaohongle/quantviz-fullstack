# API 端点文档

**项目**：QuantViz API  
**版本**：2.0 (Serverless)  
**基础 URL**：https://quantviz-fullstack.vercel.app

---

## 🌐 API 端点清单

### 1. 健康检查
```http
GET /api/health
```

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": 1776162107310,
  "uptime": 12.283,
  "environment": "production"
}
```

---

### 2. 首页数据（全球指数 + 股市资讯）
```http
GET /api/home/data
```

**响应示例**：
```json
{
  "indices": [
    {
      "code": "000001.SH",
      "name": "上证指数",
      "market": "CN",
      "value": 3280.52,
      "price": 3280.52,
      "change": -12.35,
      "changePercent": -0.38,
      "open": 3290.00,
      "high": 3295.80,
      "low": 3275.20,
      "preClose": 3292.87,
      "volume": 285000000,
      "amount": 32100000000,
      "updateTime": "2026-04-14T10:21:35.148Z"
    }
  ],
  "news": [
    {
      "id": "news1",
      "headline": "A股三大指数涨跌互现，创业板指涨0.66%",
      "summary": "今日A股三大指数开盘涨跌互现...",
      "time": "15:05",
      "datetime": "2026-04-14T07:05:00.000Z",
      "source": "东方财富"
    }
  ],
  "lastUpdate": 1776162095148,
  "updateTime": "2026-04-14 18:21:35"
}
```

**字段说明**：
- `indices`: 全球 10 大指数数组
- `news`: 股市资讯数组（最多 20 条）
- `lastUpdate`: 最后更新时间戳
- `updateTime`: 格式化的更新时间

---

### 3. 指数列表
```http
GET /api/indices
```

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "symbol": "sh000001",
      "name": "上证指数",
      "market": "CN",
      "current_price": 3280.52,
      "change_amount": -12.35,
      "change_percent": -0.38,
      "open_price": 3290,
      "high_price": 3295.80,
      "low_price": 3275.20,
      "close_price": 3292.87,
      "volume": 285000000,
      "amount": 32100000000,
      "quote_time": "2026-04-14T10:21:35.148Z"
    }
  ],
  "timestamp": 1776162095148
}
```

---

### 4. AI 推荐
```http
GET /api/recommendations
GET /api/recommendations?risk=low   # 风险偏好筛选（low/medium/high）
```

**响应示例**：
```json
{
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "price": 1680.50,
      "changePercent": 1.25,
      "sector": "白酒",
      "score": 95,
      "rating": "强烈推荐",
      "ratingColor": "#00e676",
      "targetPrice": 1850.00,
      "currentPrice": 1680.50,
      "reasons": [
        {
          "category": "基本面",
          "title": "财务数据优异",
          "detail": "2024Q3 营收增长 18.2%，净利润率 52.8%，ROE 28.5%",
          "confidence": "高",
          "source": "财报"
        }
      ],
      "risks": [
        {
          "level": "低",
          "description": "估值略高，当前 PE 约 35 倍",
          "impact": "短期可能回调 5-8%"
        }
      ],
      "accuracy": {
        "historical": "85%",
        "recent30Days": "90%",
        "predictedReturn": "+10-15%"
      }
    }
  ],
  "riskLevel": "all",
  "lastUpdate": 1776162095148
}
```

**查询参数**：
- `risk`: 风险偏好（可选）
  - `low`: 低风险（score >= 90）
  - `medium`: 中等风险（score >= 80）
  - `high`: 高风险（所有推荐）

---

### 5. 智能筛选策略
```http
GET /api/filter/strategies
```

**响应示例**：
```json
{
  "data": [
    {
      "id": "hot-today",
      "name": "今日最值得关注",
      "icon": "🔥",
      "description": "AI高分 + 资金流入 + 未追高",
      "targetUser": "每天早上快速找机会",
      "count": 6,
      "topPicks": [
        {
          "code": "600519",
          "name": "贵州茅台",
          "changePercent": 1.25,
          "score": 95
        }
      ]
    }
  ],
  "lastUpdate": 1776162095148
}
```

**策略列表**：
1. `hot-today` - 今日最值得关注
2. `value-invest` - 价值投资精选
3. `tech-growth` - 科技成长
4. `dividend-star` - 高股息红利
5. `fund-flow-in` - 资金抢筹
6. `oversold-rebound` - 超跌反弹

---

### 6. 搜索建议
```http
GET /api/search/suggestions?q=<查询关键词>
```

**查询参数**：
- `q`: 查询关键词（必填）
  - 支持股票代码（如 `600519`）
  - 支持中文名称（如 `茅台`）
  - 支持拼音（如 `maotai`）

**响应示例**：
```json
{
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "pinyin": "guizhoumaotai"
    }
  ],
  "query": "茅台",
  "count": 1
}
```

**测试示例**：
```bash
# 搜索"茅台"
curl "https://quantviz-fullstack.vercel.app/api/search/suggestions?q=茅台"

# 搜索"600519"
curl "https://quantviz-fullstack.vercel.app/api/search/suggestions?q=600519"

# 搜索"maotai"
curl "https://quantviz-fullstack.vercel.app/api/search/suggestions?q=maotai"
```

---

## 🔐 认证与授权

当前版本无需认证，所有 API 端点公开访问。如需添加认证：

```javascript
// 在 Serverless Function 中添加
module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... 业务逻辑
};
```

---

## ⚡ 性能优化

### 1. 缓存策略
Serverless Functions 无状态，建议使用：
- **Vercel KV**：键值存储（Redis 兼容）
- **Vercel Edge Config**：全局配置缓存

### 2. 响应时间
- **冷启动**：< 1s（首次访问）
- **热启动**：< 200ms（后续访问）
- **推荐**：保持函数"温暖"（定期 ping）

---

## 🐛 错误处理

所有 API 遵循统一的错误响应格式：

```json
{
  "error": "错误简要描述",
  "message": "详细错误信息",
  "code": "ERROR_CODE"  // 可选
}
```

**HTTP 状态码**：
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权
- `404` - 资源不存在
- `500` - 服务器内部错误
- `503` - 服务暂时不可用

---

## 📊 数据更新频率

| 数据类型 | 更新频率 | 说明 |
|---------|---------|------|
| 全球指数 | 实时（Mock） | 生产环境可接入真实 API |
| 股市资讯 | 实时（Mock） | 生产环境可接入新闻 API |
| AI 推荐 | 每日更新 | 基于前一交易日数据 |
| 筛选策略 | 实时计算 | 每次请求动态生成 |

---

## 🔄 版本历史

### v2.0 (2026-04-14)
- ✅ 迁移到 Vercel Serverless Functions
- ✅ 新增 6 个 API 端点
- ✅ 支持全球指数 + 股市资讯
- ✅ 优化 CORS 配置

### v1.0 (2026-04-13)
- 初始版本（Express 后端）

---

**API 文档更新时间**：2026-04-14  
**联系方式**：https://github.com/zhaohongle/quantviz-fullstack/issues
