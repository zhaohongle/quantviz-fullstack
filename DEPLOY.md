# 🚀 QuantViz 部署指南

## 方案选择

### 🎯 推荐：Render 免费部署（最简单）

**成本**：¥0/月
**限制**：15分钟无访问会休眠
**适合**：实验项目、演示

---

## 部署步骤（Render）

### 前置准备

1. **GitHub账号** - 用于托管代码
2. **Render账号** - 免费注册 https://render.com

### 步骤1：推送代码到GitHub

```bash
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack

# 初始化Git
git init
git add .
git commit -m "QuantViz完整版 - 实时数据自动更新"

# 推送到GitHub（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/quantviz-fullstack.git
git push -u origin main
```

### 步骤2：部署后端API

1. 登录 https://render.com
2. 点击 "New" → "Web Service"
3. 连接GitHub仓库 `quantviz-fullstack`
4. 配置：
   - **Name**: `quantviz-api`
   - **Environment**: Node
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. 点击 "Create Web Service"
6. 等待部署完成（约2-3分钟）
7. 记录URL，例如：`https://quantviz-api.onrender.com`

### 步骤3：部署前端

1. 点击 "New" → "Static Site"
2. 连接同一个GitHub仓库
3. 配置：
   - **Name**: `quantviz-frontend`
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Build Command**: 留空
   - **Publish Directory**: `.`
4. 点击 "Create Static Site"
5. 等待部署完成
6. 记录URL，例如：`https://quantviz-frontend.onrender.com`

### 步骤4：配置API地址

编辑 `frontend/js/api-loader.js`，修改API地址：

```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://quantviz-api.onrender.com/api';  // 替换为你的后端URL
```

重新推送代码：

```bash
git add frontend/js/api-loader.js
git commit -m "更新API地址"
git push
```

Render会自动重新部署。

### 步骤5：测试

访问前端URL：`https://quantviz-frontend.onrender.com`

检查：
- ✅ 右上角显示绿色"实时数据"
- ✅ 控制台无错误
- ✅ 数据正常显示

---

## 本地测试（部署前验证）

### 快速启动

```bash
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack
./start.sh
```

选择 "1. 完整启动"，然后访问 http://localhost:8080

### 手动启动

```bash
# 终端1 - 后端
cd backend
npm install
npm start

# 终端2 - 前端
cd frontend
python3 -m http.server 8080
```

### 测试API

```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取数据
curl http://localhost:3000/api/data

# 手动触发更新
curl -X POST http://localhost:3000/api/refresh
```

---

## 其他部署方案

### 方案2：Vercel + Render

**前端部署到Vercel**（更快）：
1. 访问 https://vercel.com
2. 导入GitHub仓库
3. Root Directory: `frontend`
4. 一键部署

**后端仍然使用Render**

### 方案3：Docker Compose（自有服务器）

```bash
# 创建 docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
  
  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    ports:
      - "80:80"
    restart: always

# 启动
docker-compose up -d
```

---

## 监控与维护

### 查看后端日志（Render）

1. 进入后端服务页面
2. 点击 "Logs" 标签
3. 实时查看更新日志：
   ```
   ⏰ 开始更新数据...
   ✅ 数据更新成功！耗时: 1523ms
   ```

### 手动触发更新

```bash
curl -X POST https://quantviz-api.onrender.com/api/refresh
```

### 健康检查

```bash
curl https://quantviz-api.onrender.com/api/health
```

---

## 性能优化

### 前端优化

1. **启用浏览器缓存**：修改 `index.html` 添加缓存头
2. **压缩静态资源**：使用 gzip
3. **CDN加速**：Render自带CDN

### 后端优化

1. **增加缓存时间**：修改 `server.js` 的缓存TTL
2. **使用Redis**：存储缓存数据（需付费）
3. **减少股票数量**：只监控核心股票

---

## 常见问题

### Q1: 服务休眠怎么办？

**问题**：Render免费套餐15分钟无访问会休眠
**解决**：
1. 使用 UptimeRobot 定时ping（免费）
2. 升级到付费套餐（$7/月）

### Q2: API跨域错误？

**问题**：前端无法访问API
**解决**：后端已配置CORS，检查API_BASE配置

### Q3: 数据不更新？

**问题**：定时任务未运行
**解决**：检查后端日志，确认cron任务正常

### Q4: 如何增加股票？

编辑 `backend/data-fetcher.js`：

```javascript
const STOCK_CODES = [
  'sh600519',  // 贵州茅台
  'sz002371',  // 北方华创
  // 添加更多...
  'sh600036',  // 招商银行
];
```

---

## 成本分析

| 服务 | 用途 | 免费额度 | 付费价格 |
|------|------|---------|---------|
| Render后端 | API服务 | 750h/月 | $7/月 |
| Render前端 | 静态网站 | 100GB带宽 | 免费 |
| Vercel前端 | 静态网站（备选） | 100GB带宽 | 免费 |
| GitHub | 代码托管 | 无限 | 免费 |
| **总计** | - | **¥0/月** | - |

---

## 🎉 完成！

部署完成后，你将拥有：

✅ 一个公网可访问的股票数据网站
✅ 数据自动更新（交易时间5分钟，非交易时间30分钟）
✅ 完全免费（Render免费套餐）
✅ 真实的股票数据（腾讯API）

**演示效果**：
- 实时状态指示器（右上角绿点）
- 数据每30秒刷新
- 后台自动抓取最新行情

---

**需要帮助？**
查看 README.md 或项目Issues
