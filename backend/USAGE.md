# QuantViz 真实数据连接 - 使用指南

## 🚀 快速启动

### 1. 启动后端服务器

```bash
cd quantviz-fullstack/backend
node server.js
```

服务器将在 `http://localhost:3001` 启动（如果端口被占用，使用 `PORT=3002 node server.js`）

### 2. 验证 API 连接

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取所有数据
curl http://localhost:3001/api/data

# 获取指数数据
curl http://localhost:3001/api/indices

# 获取股票数据
curl http://localhost:3001/api/stocks

# 获取板块数据
curl http://localhost:3001/api/sectors

# 获取推荐
curl http://localhost:3001/api/recommendations
```

### 3. 手动触发数据更新

```bash
curl -X POST http://localhost:3001/api/refresh
```

---

## 📊 数据源说明

### 新浪财经 API
- **股票实时行情**: `https://hq.sinajs.cn/list={codes}`
- **指数数据**: 包含上证指数、深证成指、创业板指、科创50
- **数据格式**: GBK 编码，逗号分隔
- **更新频率**: 实时（延迟约 3-5 秒）

### 东方财富 API
- **板块资金流**: `http://push2.eastmoney.com/api/qt/clist/get`
- **数据格式**: JSON
- **更新频率**: 实时
- **注意**: 该 API 偶尔不稳定，有降级方案（使用股票数据聚合）

---

## ⚙️ 配置说明

### 环境变量 (`.env`)

```bash
# 服务器端口
PORT=3001

# 更新频率（分钟）
UPDATE_INTERVAL_TRADING=5      # 交易时间
UPDATE_INTERVAL_OFFHOURS=30    # 非交易时间

# 日志级别
LOG_LEVEL=info
```

### 股票池配置 (`data-fetcher.js`)

当前配置了 20 只代表性 A 股股票：

```javascript
const STOCK_CODES = [
  'sh600519', // 贵州茅台
  'sz002371', // 北方华创
  'sh688981', // 中芯国际
  'sz300750', // 宁德时代
  // ... 更多股票
];
```

**如何添加更多股票**：
1. 打开 `backend/data-fetcher.js`
2. 在 `STOCK_CODES` 数组中添加股票代码（格式：`sh` + 代码 或 `sz` + 代码）
3. 重启服务器

---

## 🔍 API 测试

### 运行完整测试

```bash
cd quantviz-fullstack/backend
node test-api.js
```

测试包含：
1. 股票实时行情（新浪财经）
2. 指数数据（新浪财经）
3. 板块资金流（东方财富）
4. 完整数据流
5. 性能测试

预期输出：
```
========== 测试报告 ==========

✅ 成功: 5 项
   ✓ 股票行情
   ✓ 指数数据
   ✓ 板块资金流
   ✓ 完整数据流
   ✓ 性能测试

🎉 恭喜！所有测试通过！
```

---

## ⏰ 自动更新机制

### 交易时间（周一至五 9:30-15:00）
- 每 **5 分钟** 更新一次数据
- 确保行情数据实时性

### 非交易时间
- 每 **30 分钟** 更新一次数据
- 减少 API 请求压力

### 首次启动
- 立即更新数据
- 确保服务器启动后有可用数据

---

## 🛠️ 故障排查

### 1. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use 0.0.0.0:3001`

**解决**:
```bash
# 方案 1: 杀死占用端口的进程
lsof -ti:3001 | xargs kill -9

# 方案 2: 使用其他端口
PORT=3002 node server.js
```

### 2. API 请求失败

**问题**: `❌ 抓取指数失败: socket hang up`

**原因**: 
- 网络连接问题
- API 服务暂时不可用
- 请求频率过高被限流

**解决**:
- 检查网络连接
- 等待 1-2 分钟后重试
- 查看 API 错误日志

### 3. 数据为空

**问题**: 前端显示"数据加载中"

**检查**:
```bash
# 1. 检查服务器是否启动
curl http://localhost:3001/api/health

# 2. 检查数据是否存在
curl http://localhost:3001/api/data

# 3. 手动触发更新
curl -X POST http://localhost:3001/api/refresh
```

### 4. 板块数据获取失败

**问题**: 东方财富 API 不稳定

**自动降级**: 系统会自动使用股票数据聚合生成板块数据

**手动修复**:
- 增加重试延迟（修改 `api-client.js` 中的 `RETRY_DELAY`）
- 或使用其他数据源

---

## 📈 性能优化建议

### 1. 启用缓存（推荐）
- 使用 PostgreSQL 或 Redis 缓存数据
- 减少 API 请求次数
- 提升响应速度

### 2. 增加并发控制
- 限制同时请求数量
- 避免 API 限流

### 3. 实现离线模式
- 保存历史数据
- API 失败时使用缓存数据

---

## 🔐 安全建议

### 1. 使用反向代理
- 不要直接暴露后端服务器
- 使用 Nginx / Caddy 作为反向代理

### 2. 限流保护
- 防止 API 滥用
- 保护外部数据源

### 3. 错误监控
- 集成 Sentry / Datadog
- 实时监控 API 错误

---

## 📞 联系支持

如遇到问题，请提供以下信息：
1. 错误日志（`node server.js` 输出）
2. API 测试结果（`node test-api.js` 输出）
3. 系统环境（Node 版本、操作系统）

---

_文档更新时间: 2026-04-14_
