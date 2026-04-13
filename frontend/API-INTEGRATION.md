# QuantViz Frontend - API 集成说明

## 📂 项目结构

```
frontend/
├── pages/
│   ├── prd1/              # PRD1 全球指数
│   │   ├── indices.html           ✅ 已集成API
│   │   ├── index-detail.html      ⚠️ 待集成
│   │   └── news-detail.html       ⚠️ 待集成
│   ├── prd2/              # PRD2 板块资金流
│   │   ├── sectors.html           ⚠️ 待集成
│   │   ├── sector-detail.html     ⚠️ 待集成
│   │   └── bubble-chart.html      ⚠️ 待集成
│   └── prd3/              # PRD3 AI推荐
│       ├── recommendations.html   ⚠️ 待集成
│       ├── detail.html            ⚠️ 待集成
│       ├── accuracy.html          ⚠️ 待集成
│       └── history.html           ⚠️ 待集成
├── components/
│   ├── navigation.html    # 导航组件
│   ├── mobile-menu.html   # 移动端菜单
│   └── loading.html       # 加载组件
├── css/
│   ├── design-system.css  ✅ 统一设计系统
│   └── ...
├── js/
│   ├── api-integration.js ✅ API集成库
│   └── ...
└── index-new.html         # 新主页
```

## 🔧 如何集成API

### 方法 1：使用统一的API库（推荐）

在任何页面的 `<head>` 中添加：

```html
<!-- 引入设计系统CSS -->
<link rel="stylesheet" href="../../css/design-system.css">

<!-- 引入API集成库 -->
<script src="../../js/api-integration.js"></script>
```

然后在页面底部添加初始化代码：

```html
<script>
document.addEventListener('DOMContentLoaded', async () => {
    // 获取指数数据
    const indices = await fetchIndices();
    console.log('指数数据:', indices);
    
    // 获取新闻数据
    const news = await fetchNews();
    console.log('新闻数据:', news);
    
    // 渲染页面（自定义渲染逻辑）
    renderPage(indices, news);
});

function renderPage(indices, news) {
    // 实现你的渲染逻辑
}
</script>
```

### 方法 2：直接使用 fetch（简单场景）

```html
<script>
const API_BASE_URL = 'http://localhost:3000/api';

async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/indices`);
        const result = await response.json();
        console.log('数据:', result.data);
        return result.data;
    } catch (error) {
        console.error('加载失败:', error);
        return []; // 返回空数组
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    // 渲染页面
});
</script>
```

## 📡 可用的 API 端点

| 端点 | 说明 | 返回数据 |
|------|------|----------|
| `/api/indices` | 全球指数 | 上证、深证、科创50、纳斯达克等 |
| `/api/stocks` | 股票数据 | 个股行情 |
| `/api/sectors` | 板块数据 | 板块涨跌和资金流向 |
| `/api/news` | 实时新闻 | 财经快讯 |
| `/api/recommendations` | AI推荐 | 推荐策略 |
| `/api/ranking` | 涨跌榜 | 涨幅榜和跌幅榜 |
| `/api/data` | 完整数据 | 一次性获取所有数据 |

## 🎨 设计系统使用

所有页面应该引用 `css/design-system.css` 以保持一致的视觉风格。

### 常用样式类

```html
<!-- 卡片 -->
<div class="section-card">
    <h2 class="section-title">📊 标题</h2>
    <!-- 内容 -->
</div>

<!-- 按钮 -->
<button class="btn btn-primary">主按钮</button>
<button class="btn btn-secondary">次按钮</button>
<button class="btn btn-outline">边框按钮</button>

<!-- 价格和涨跌幅 -->
<div class="price">3,241.28</div>
<div class="change up">+1.46% ↑</div>
<div class="change down">-0.44% ↓</div>

<!-- 标签 -->
<span class="tag">#半导体</span>
```

## 🧪 测试流程

### 1. 启动后端服务

```bash
cd ../backend
npm start
```

后端服务运行在 `http://localhost:3000`

### 2. 启动前端服务

```bash
cd frontend
python3 -m http.server 8080
# 或者使用其他服务器
# npx http-server -p 8080
```

前端访问地址：`http://localhost:8080`

### 3. 验证 API 连接

打开浏览器控制台，查看：
- ✅ 无网络错误
- ✅ API 返回数据正常
- ✅ 页面渲染完整

### 4. 测试降级机制

停止后端服务，页面应该：
- ⚠️ 显示错误信息（或使用 mock 数据）
- ✅ 不会白屏或崩溃

## ⚡ 优化建议

### 1. 数据缓存

```javascript
let cachedData = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 60秒

async function fetchWithCache(endpoint) {
    const now = Date.now();
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
        return cachedData; // 使用缓存
    }
    
    const data = await fetch(`${API_BASE_URL}/${endpoint}`);
    cachedData = data;
    lastFetch = now;
    return data;
}
```

### 2. 错误处理

```javascript
async function safeApiCall(apiFunc, fallback = []) {
    try {
        return await apiFunc();
    } catch (error) {
        console.error('API调用失败:', error);
        showError('container-id', error.message);
        return fallback;
    }
}
```

### 3. 加载状态

```javascript
async function loadPageData() {
    showLoading('data-container', true);
    
    try {
        const data = await fetchIndices();
        renderData(data);
    } catch (error) {
        showError('data-container', error.message);
    } finally {
        showLoading('data-container', false);
    }
}
```

## 📝 待完成任务

- [ ] 完成 prd1/index-detail.html API 集成
- [ ] 完成 prd1/news-detail.html API 集成
- [ ] 完成 prd2/sectors.html API 集成
- [ ] 完成 prd2/sector-detail.html API 集成
- [ ] 完成 prd2/bubble-chart.html API 集成
- [ ] 完成 prd3/recommendations.html API 集成
- [ ] 完成 prd3/detail.html API 集成
- [ ] 完成 prd3/accuracy.html API 集成
- [ ] 完成 prd3/history.html API 集成
- [ ] 添加全局导航组件
- [ ] 测试所有页面的响应式布局
- [ ] 性能优化（懒加载、缓存）

## 🐛 已知问题

1. ⚠️ `indices.html` 的静态HTML内容未动态渲染（需要重构）
2. ⚠️ 导航组件尚未集成到各页面
3. ⚠️ 移动端测试不充分

## 📞 联系方式

如有问题，请联系项目维护者。

---

**最后更新**: 2026-04-13
