# 🚀 QuantViz 快速启动指南

## 📋 前置要求

- Node.js >= 14.x
- Python 3.x（用于启动简单HTTP服务器）
- 现代浏览器（Chrome/Firefox/Safari）

---

## ⚡ 快速启动

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖（首次运行）
npm install

# 启动后端服务
npm start
```

后端服务将运行在: **http://localhost:3000**

### 2. 启动前端服务

**方法 1: Python HTTP Server（推荐）**
```bash
# 新开一个终端窗口
cd frontend

# 启动服务
python3 -m http.server 8080
```

**方法 2: Node.js http-server**
```bash
cd frontend

# 安装 http-server（首次运行）
npm install -g http-server

# 启动服务
http-server -p 8080
```

**方法 3: VS Code Live Server**
- 安装 "Live Server" 扩展
- 右键 `frontend/index.html` → "Open with Live Server"

前端访问地址: **http://localhost:8080**

---

## 🧪 测试 API 集成

### 1. 访问 API 测试页面

打开浏览器访问:
```
http://localhost:8080/demo-api-integration.html
```

这个页面会显示：
- ✅ API 连接状态
- 📊 实时指数数据
- 📰 新闻数据
- 💼 板块数据

### 2. 检查后端 API

直接访问 API 端点：
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取指数数据
curl http://localhost:3000/api/indices

# 获取新闻数据
curl http://localhost:3000/api/news
```

---

## 📁 页面导航

### 主页面
- **旧主页**: http://localhost:8080/index.html
- **新主页**: http://localhost:8080/index-new.html

### PRD1: 全球指数
- **指数列表**: http://localhost:8080/pages/prd1/indices.html ✅ (已集成API)
- **指数详情**: http://localhost:8080/pages/prd1/index-detail.html
- **新闻详情**: http://localhost:8080/pages/prd1/news-detail.html

### PRD2: 板块资金流
- **板块资金流**: http://localhost:8080/pages/prd2/sectors.html
- **板块详情**: http://localhost:8080/pages/prd2/sector-detail.html
- **气泡图**: http://localhost:8080/pages/prd2/bubble-chart.html

### PRD3: AI推荐
- **AI推荐列表**: http://localhost:8080/pages/prd3/recommendations.html
- **推荐详情**: http://localhost:8080/pages/prd3/detail.html
- **准确率追踪**: http://localhost:8080/pages/prd3/accuracy.html
- **历史记录**: http://localhost:8080/pages/prd3/history.html

---

## 🐛 常见问题

### 问题 1: API 连接失败

**症状**: 页面显示 "❌ 连接失败" 或控制台有网络错误

**解决方案**:
```bash
# 1. 确认后端服务正在运行
curl http://localhost:3000/api/health

# 2. 检查端口是否被占用
lsof -i :3000

# 3. 重启后端服务
cd backend && npm start
```

### 问题 2: CORS 错误

**症状**: 控制台显示 "Access-Control-Allow-Origin" 错误

**解决方案**:
后端已经配置了 CORS，如果仍然出现问题：
```javascript
// backend/server.js 中已有配置
app.use(cors());
```

### 问题 3: 页面空白或样式错误

**症状**: 页面显示空白或样式不正确

**解决方案**:
```bash
# 1. 检查文件路径是否正确
# 确保 CSS 和 JS 文件路径正确

# 2. 检查浏览器控制台
# 查看是否有 404 错误或其他错误

# 3. 清除浏览器缓存
# Ctrl+Shift+R (Chrome) 或 Cmd+Shift+R (Mac)
```

### 问题 4: 数据不更新

**症状**: 页面显示旧数据

**解决方案**:
```bash
# 1. 手动触发后端数据更新
curl -X POST http://localhost:3000/api/refresh

# 2. 检查后端数据更新时间
curl http://localhost:3000/api/health
```

---

## 📊 开发工具

### 浏览器开发者工具

**Chrome DevTools**:
```
F12 或 Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)
```

重要面板：
- **Console**: 查看日志和错误
- **Network**: 查看 API 请求
- **Elements**: 检查 HTML/CSS
- **Application**: 查看缓存和存储

### API 测试工具

**使用 curl**:
```bash
# GET 请求
curl http://localhost:3000/api/indices

# POST 请求
curl -X POST http://localhost:3000/api/refresh

# 格式化 JSON 输出
curl http://localhost:3000/api/indices | python3 -m json.tool
```

**使用 Postman**:
1. 下载 Postman: https://www.postman.com/
2. 创建新请求
3. 输入 URL: `http://localhost:3000/api/indices`
4. 点击 Send

---

## 🔧 开发模式

### 自动重载

**后端自动重载（使用 nodemon）**:
```bash
cd backend

# 安装 nodemon
npm install -g nodemon

# 使用 nodemon 启动
nodemon server.js
```

**前端自动重载（使用 Live Server）**:
- VS Code 安装 Live Server 扩展
- 右键 HTML 文件 → "Open with Live Server"

### 调试技巧

**前端调试**:
```javascript
// 在代码中添加断点
debugger;

// 查看变量
console.log('数据:', data);

// 查看网络请求
console.table(indices);
```

**后端调试**:
```javascript
// backend/server.js
console.log('📊 数据更新:', cachedData.lastUpdate);
```

---

## 📝 下一步

1. **完成 API 集成**:
   - 参考 `API-INTEGRATION.md`
   - 修改其余页面，添加动态数据加载

2. **添加导航**:
   - 在所有页面添加统一导航栏
   - 使用 `components/navigation.html`

3. **测试**:
   - 测试所有页面加载
   - 测试移动端响应式
   - 测试 API 错误处理

4. **优化**:
   - 添加加载动画
   - 优化性能
   - 改进用户体验

---

## 📚 相关文档

- **API 集成指南**: `API-INTEGRATION.md`
- **完成报告**: `INTEGRATION-REPORT.md`
- **设计系统**: `css/design-system.css`
- **API 库**: `js/api-integration.js`

---

## 💬 反馈与支持

如有问题或建议，请：
1. 查看相关文档
2. 检查浏览器控制台
3. 查看后端日志
4. 联系项目维护者

---

**祝开发顺利！** 🚀
