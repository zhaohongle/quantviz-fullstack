# QuantViz 完整版 - 实时数据自动更新

## 🎯 项目特点

✅ **完整的前后端分离架构**
✅ **实时数据自动更新**（交易时间5分钟，非交易时间30分钟）
✅ **免费部署方案**（Render免费套餐）
✅ **真实股票数据**（腾讯财经API）
✅ **优雅降级**（API失败时使用本地mock数据）

---

## 📁 项目结构

```
quantviz-fullstack/
├── backend/              # Node.js后端API
│   ├── server.js        # Express服务器
│   ├── data-fetcher.js  # 数据抓取模块
│   └── package.json     # 依赖配置
│
├── frontend/            # 前端静态文件
│   ├── index.html       # 网站首页
│   ├── css/             # 样式
│   └── js/              # JavaScript
│       ├── mock-data.js      # 本地mock数据（降级用）
│       ├── api-loader.js     # API数据加载器
│       ├── app.js            # 应用逻辑
│       ├── charts.js         # 图表
│       ├── components.js     # 组件
│       └── particles.js      # 背景动画
│
├── README.md            # 本文件
└── deploy-guide.md      # 部署指南
```

---

## 🚀 本地运行

### 步骤1：启动后端API

```bash
cd backend
npm install
npm start
```

服务将在 http://localhost:3000 启动

### 步骤2：启动前端

```bash
cd frontend
python3 -m http.server 8080
```

访问 http://localhost:8080

---

## 📊 API接口

### 健康检查
```
GET /api/health
```

### 获取所有数据（推荐）
```
GET /api/data

Response:
{
  "indices": [...],      // 指数数据
  "stocks": [...],       // 股票数据
  "sectors": [...],      // 板块数据
  "news": [...],         // 实时快讯
  "recommendations": [...],  // AI推荐
  "ranking": {...},      // 涨跌榜
  "lastUpdate": 1234567890,
  "updateTime": "2026-04-01 19:30:00"
}
```

### 其他接口
- `GET /api/indices` - 指数数据
- `GET /api/stocks` - 股票数据
- `GET /api/sectors` - 板块数据
- `GET /api/news` - 实时快讯
- `GET /api/recommendations` - AI推荐
- `GET /api/ranking` - 涨跌榜
- `POST /api/refresh` - 手动触发更新

---

## ⏰ 自动更新策略

### 后端定时任务
- **交易时间**（周一至五 9:30-15:00）：每5分钟更新
- **非交易时间**：每30分钟更新
- **服务启动**：立即更新一次

### 前端自动刷新
- 每30秒从API拉取最新数据
- 更新后自动刷新页面显示
- 右上角显示实时状态指示器

---

## 🌐 部署到Render（免费）

### 方式1：一键部署（推荐）

1. 将项目推送到GitHub
2. 访问 https://render.com
3. 创建两个服务：

#### Backend (Web Service)
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && node server.js`
- Environment: Node.js
- Port: 3000

#### Frontend (Static Site)
- Build Command: 留空
- Publish Directory: `frontend`

4. 配置环境变量（Backend）:
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. 完成！自动获得免费域名

### 方式2：Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🎨 功能特性

### 实时数据
✅ 4个主要指数（上证、深证、创业板、科创50）
✅ 20只热门股票
✅ 10个板块资金流向
✅ 实时快讯（AI生成）
✅ AI投资推荐
✅ 涨跌幅排行榜

### 自动更新
✅ 后端定时抓取数据
✅ 前端自动刷新显示
✅ 实时状态指示器
✅ 优雅降级处理

### 数据来源
- **腾讯财经API**：http://qt.gtimg.cn/
- **编码转换**：GBK → UTF-8
- **数据解析**：自动解析行情字符串
- **AI生成**：新闻、推荐等内容

---

## 📝 数据更新日志

所有数据更新都会在后端控制台输出：

```
⏰ 开始更新数据...
✅ 数据更新成功！耗时: 1523ms
   指数: 4个
   股票: 20只
   新闻: 5条
```

前端控制台也会显示加载状态：

```
🚀 初始化API数据加载器...
✅ API数据加载成功
  指数: 4
  股票: 20
  新闻: 5
  更新时间: 2026-04-01 19:30:00
```

---

## 🔧 配置说明

### 后端配置
编辑 `backend/data-fetcher.js` 修改股票列表：

```javascript
const STOCK_CODES = [
  'sh600519', // 贵州茅台
  'sz002371', // 北方华创
  // ... 添加更多股票代码
];
```

### 前端配置
编辑 `frontend/js/api-loader.js` 修改刷新间隔：

```javascript
startAutoRefresh(30000); // 30秒，可改为60000（1分钟）
```

---

## ⚠️ 免责声明

本项目仅供学习和演示使用，所有数据和推荐仅供参考，不构成投资建议。
投资有风险，入市需谨慎。

---

## 📞 技术支持

### 常见问题

**Q: 为什么API返回503？**
A: 数据还在加载中，等待5-10秒后刷新页面

**Q: 数据不更新怎么办？**
A: 检查后端日志，确认定时任务是否正常运行

**Q: 可以增加更多股票吗？**
A: 可以！编辑 `backend/data-fetcher.js` 的 `STOCK_CODES` 数组

**Q: 免费部署有限制吗？**
A: Render免费套餐：15分钟无访问会休眠，750小时/月

---

## 🎉 完成！

项目已完全配置好，可以直接运行或部署！

**本地测试**：
```bash
# 终端1
cd backend && npm install && npm start

# 终端2
cd frontend && python3 -m http.server 8080
```

**访问**：http://localhost:8080

**效果**：
- 右上角显示绿色实时状态
- 数据每30秒自动刷新
- 控制台显示更新日志

---

**创建时间**：2026-04-01 19:25
**版本**：v2.0-realtime
