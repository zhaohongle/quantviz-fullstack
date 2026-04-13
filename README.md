# QuantViz 智能交易平台 V2

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0-blue)
![API](https://img.shields.io/badge/API-Integrated-success)
![Design](https://img.shields.io/badge/Design-MVP%20Style-orange)

**实时行情 · 智能分析 · AI 推荐**

---

## 🎯 项目概述

QuantViz 是一个基于 AI 的智能交易平台，提供全球指数实时行情、板块资金流向分析、AI 精选股票推荐等功能。

本项目采用单页应用（SPA）架构，保持 MVP 版本的设计风格，提供流畅的用户体验。

---

## ✨ 核心功能

### 📊 实时仪表盘
- 全市场核心数据一览
- 实时更新
- 可视化展示

### 🌍 全球指数
- A 股、美股、港股指数
- 实时行情
- 技术指标分析
- K 线图（待集成 ECharts）

### 📈 板块资金流向
- 20+ 行业板块监控
- 资金流入/流出实时追踪
- 龙头股识别
- 气泡图可视化

### 🤖 AI 精选推荐
- AI 算法筛选优质标的
- 综合评分系统
- 预期收益预测
- 准确率追踪
- 历史推荐记录

---

## 🚀 快速开始

### 前置要求
- Node.js >= 14.x
- Python 3.x（可选，用于前端服务）

### 一键启动
```bash
./start.sh
```

访问：`http://localhost:3000/app.html`

### 手动启动

**启动后端**
```bash
cd backend
npm install
npm start
```

**启动前端**
```bash
cd frontend
python3 -m http.server 3000
# 或
npx http-server -p 3000
```

### 停止服务
```bash
./stop.sh
```

---

## 📁 项目结构

```
quantviz-fullstack/
├── frontend/                   # 前端应用
│   ├── app.html               # 主应用（SPA）★
│   ├── index-new.html         # 旧版导航页
│   ├── js/
│   │   └── api-integration.js # API 集成库
│   ├── pages/
│   │   ├── prd1/              # 全球指数
│   │   │   ├── indices.html
│   │   │   ├── index-detail.html
│   │   │   └── news-detail.html
│   │   ├── prd2/              # 板块资金流
│   │   │   ├── sectors.html
│   │   │   ├── sector-detail.html
│   │   │   └── bubble-chart.html
│   │   └── prd3/              # AI 推荐
│   │       ├── recommendations.html
│   │       ├── detail.html
│   │       ├── accuracy.html
│   │       └── history.html
│   └── components/            # UI 组件
│       ├── navigation.html
│       ├── mobile-menu.html
│       └── loading.html
├── backend/                    # 后端 API
│   ├── server.js              # Express 服务器
│   └── data-fetcher.js        # 数据抓取模块
├── start.sh                    # 快速启动脚本
├── stop.sh                     # 停止脚本
└── verify-integration.sh       # 集成验证脚本
```

---

## 🔧 技术栈

### 前端
- **架构**：原生 HTML + CSS + JavaScript（无框架依赖）
- **样式**：响应式设计、Mobile-First
- **动画**：CSS3 过渡动画
- **API**：Fetch API + 优雅降级

### 后端
- **运行时**：Node.js 14+
- **框架**：Express
- **API**：RESTful
- **定时任务**：node-cron
- **跨域**：CORS

### 设计
- **风格**：基于 MVP 版本
- **配色**：#1E3A8A（深蓝）+ #F59E0B（金色）
- **字体**：Source Han Sans CN + DIN（数字）
- **布局**：卡片式设计、8px 网格系统

---

## 📡 API 端点

### 已实现
- `GET /api/health` - 健康检查
- `GET /api/indices` - 获取指数数据
- `GET /api/news` - 获取新闻资讯
- `GET /api/data` - 获取所有数据

### 待实现（使用 Mock 数据降级）
- `GET /api/stocks` - 获取股票数据
- `GET /api/sectors` - 获取板块数据
- `GET /api/recommendations` - 获取 AI 推荐
- `GET /api/ranking` - 获取涨跌榜

---

## 🎨 设计规范

### 配色方案
- **主色**：#1E3A8A（深蓝）
- **辅助色**：#F59E0B（金色）
- **成功色**：#10B981（绿色）
- **危险色**：#EF4444（红色）
- **中性色**：#6B7280（灰色）

### 字体
- **中文**：Source Han Sans CN
- **英文**：Roboto
- **数字**：DIN / Roboto Mono

### 间距
- 基础单位：8px
- 常用间距：8px, 16px, 24px, 32px, 48px

---

## 📊 功能清单

### 已完成（100%）
- [x] SPA 主应用架构
- [x] MVP 风格导航栏
- [x] 4 个频道切换
- [x] 13 个页面 API 集成
- [x] 响应式设计（桌面+移动）
- [x] 优雅降级机制
- [x] 错误处理
- [x] 加载状态
- [x] 平滑动画

### 待开发
- [ ] ECharts 图表集成
- [ ] WebSocket 实时推送
- [ ] 用户登录/注册
- [ ] 自选股管理
- [ ] 深色模式
- [ ] 全局搜索
- [ ] 消息通知

---

## 🧪 测试

### 运行验证脚本
```bash
./verify-integration.sh
```

### 手动测试
1. 访问 `http://localhost:3000/app.html`
2. 点击导航菜单切换频道
3. 检查数据是否正常加载
4. 测试移动端响应式布局
5. 关闭后端，验证 Mock 数据降级

---

## 📚 文档

- [API 集成清单](frontend/API-INTEGRATION-CHECKLIST.md)
- [最终交付报告](FINAL-DELIVERY-REPORT.md)
- [设计原型](handoff/prototypes/v2/)

---

## 🐛 已知问题

1. **图表占位符**：需要集成 ECharts
2. **部分 API 未实现**：使用 Mock 数据降级
3. **无用户系统**：所有数据公开访问

---

## 🛠️ 开发指南

### 添加新频道
1. 在 `app.html` 中添加新的 `<div class="channel">`
2. 在导航栏添加新的 `<a class="nav-link">`
3. 在 JavaScript 中添加加载逻辑

### 添加新 API
1. 在 `backend/server.js` 中添加路由
2. 在 `backend/data-fetcher.js` 中添加数据抓取逻辑
3. 在 `frontend/js/api-integration.js` 中添加 API 函数

### 添加新页面
1. 在 `frontend/pages/` 下创建 HTML 文件
2. 创建对应的 `-api.js` 文件
3. 在页面中注入 `api-integration.js`

---

## 📈 性能优化

- ✅ 按需加载页面内容
- ✅ 已加载频道缓存
- ✅ 并行 API 请求
- ✅ CSS 动画代替 JavaScript
- ✅ 优雅降级减少失败影响

---

## 🔒 安全性

- ✅ CORS 跨域保护
- ✅ API 错误处理
- ⚠️ 无用户认证（待开发）
- ⚠️ 无数据加密（待开发）

---

## 📄 许可证

本项目为商业项目，版权所有。

---

## 👥 团队

- **产品经理**：Alex
- **开发团队**：QuantViz Team
- **设计团队**：QuantViz Design

---

## 📞 支持

- **技术支持**：[技术文档](FINAL-DELIVERY-REPORT.md)
- **问题反馈**：提交 Issue
- **功能建议**：联系产品团队

---

**🎉 项目已就绪，立即开始体验！** 🚀
