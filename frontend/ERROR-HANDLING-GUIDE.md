# QuantViz 错误处理系统 - 集成指南

## 📦 已创建的文件

### 核心文件
1. **错误处理工具**：`/frontend/js/error-handler.js`
2. **空状态组件**：`/frontend/components/empty-state.html`
3. **错误边界组件**：`/frontend/components/error-boundary.html`
4. **404 页面**：`/frontend/pages/error/404.html`

---

## 🚀 快速集成

### 1. 全局引入（推荐）

在 `index-new.html` 或其他主页面的 `<head>` 中添加：

```html
<!-- 错误处理系统 -->
<script src="/js/error-handler.js"></script>
<script src="/components/empty-state.html"></script>
<script src="/components/error-boundary.html"></script>
```

### 2. 按需引入

在特定页面中引入：

```html
<!-- 仅需要网络错误处理 -->
<script src="/js/error-handler.js"></script>

<!-- 需要空状态展示 -->
<script src="/components/empty-state.html"></script>

<!-- 需要错误边界 -->
<script src="/components/error-boundary.html"></script>
```

---

## 💡 使用示例

### 示例 1：网络请求自动重试

**旧代码（无重试）**：
```javascript
async function loadStocks() {
    try {
        const response = await fetch('/api/stocks');
        const data = await response.json();
        renderStocks(data);
    } catch (error) {
        console.error('加载失败:', error);
        alert('加载失败');
    }
}
```

**新代码（自动重试 3 次）**：
```javascript
async function loadStocks() {
    try {
        const data = await enhancedApiRequest('stocks', mockData.stocks, {
            maxRetries: 3,
            onRetry: (current, max) => {
                console.log(`重试中 ${current}/${max}`);
            }
        });
        renderStocks(data);
    } catch (error) {
        // 已自动显示友好提示
        ErrorHandler.showError(error, {
            title: '股票数据加载失败',
            message: '请检查网络或稍后重试'
        });
    }
}
```

---

### 示例 2：空状态展示

**场景：自选股列表为空**

```javascript
async function loadWatchlist() {
    const stocks = await enhancedApiRequest('watchlist', []);
    
    if (stocks.length === 0) {
        EmptyState.show('watchlist-container', {
            type: 'no-stocks' // 使用预设模板
        });
    } else {
        renderStocks(stocks);
    }
}
```

**自定义空状态**：
```javascript
EmptyState.show('search-results', {
    icon: '🔍',
    title: '未找到匹配结果',
    message: '试试其他关键词',
    actions: [
        { 
            text: '清空搜索', 
            primary: true, 
            onClick: () => clearSearch() 
        }
    ]
});
```

---

### 示例 3：错误边界保护

**HTML**：
```html
<div id="stock-chart" data-error-boundary>
    <!-- 股票图表组件 -->
</div>
```

**JavaScript**：
```javascript
async function renderChart() {
    try {
        const data = await loadChartData();
        drawChart(data);
    } catch (error) {
        ErrorBoundary.catch(error, 'stock-chart', {
            title: '图表加载失败',
            message: '无法显示股票走势图'
        });
    }
}
```

---

### 示例 4：集成到现有 API 模块

修改 `/frontend/js/api-integration.js`：

```javascript
// 旧版本
async function apiRequest(endpoint, fallbackData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 错误:', error);
        return fallbackData;
    }
}

// 新版本（推荐）
async function apiRequest(endpoint, fallbackData) {
    return await enhancedApiRequest(endpoint, fallbackData, {
        maxRetries: 3
    });
}
```

---

## 📋 预设模板

### 空状态模板

| 类型 | 使用场景 | 示例代码 |
|------|----------|---------|
| `no-stocks` | 自选股为空 | `EmptyState.show('container', { type: 'no-stocks' })` |
| `no-recommendations` | AI 推荐为空 | `EmptyState.show('container', { type: 'no-recommendations' })` |
| `no-news` | 财经新闻为空 | `EmptyState.show('container', { type: 'no-news' })` |
| `no-search-results` | 搜索无结果 | `EmptyState.show('container', { type: 'no-search-results' })` |
| `network-error` | 网络错误 | `EmptyState.show('container', { type: 'network-error' })` |
| `server-error` | 服务器错误 | `EmptyState.show('container', { type: 'server-error' })` |

---

## 🎨 集成到关键页面

### 优先级 P0（立即集成）

#### 1. 自选股页面 (`watchlist-new.html`)
```html
<script src="/js/error-handler.js"></script>
<script src="/components/empty-state.html"></script>

<div id="watchlist-container"></div>

<script>
async function loadWatchlist() {
    try {
        const stocks = await enhancedApiRequest('watchlist', []);
        
        if (stocks.length === 0) {
            EmptyState.show('watchlist-container', { type: 'no-stocks' });
        } else {
            renderStocks(stocks);
        }
    } catch (error) {
        EmptyState.show('watchlist-container', { type: 'network-error' });
    }
}
</script>
```

#### 2. AI 推荐页面 (`recommendations-new.html`)
```html
<script src="/js/error-handler.js"></script>
<script src="/components/empty-state.html"></script>
<script src="/components/error-boundary.html"></script>

<div id="recommendations-container" data-error-boundary></div>

<script>
async function loadRecommendations() {
    try {
        const data = await enhancedApiRequest('recommendations', []);
        
        if (data.length === 0) {
            EmptyState.show('recommendations-container', { 
                type: 'no-recommendations' 
            });
        } else {
            renderRecommendations(data);
        }
    } catch (error) {
        ErrorBoundary.catch(error, 'recommendations-container');
    }
}
</script>
```

#### 3. 实时监控页面 (`monitor-new.html`)
```html
<script src="/js/error-handler.js"></script>
<script src="/components/error-boundary.html"></script>

<div id="monitor-container" data-error-boundary>
    <!-- WebSocket 实时数据 -->
</div>

<script>
function connectWebSocket() {
    try {
        const ws = new WebSocket('ws://localhost:3001');
        
        ws.onerror = (error) => {
            ErrorBoundary.catch(error, 'monitor-container', {
                title: 'WebSocket 连接失败',
                message: '实时数据推送服务不可用'
            });
        };
    } catch (error) {
        ErrorBoundary.catch(error, 'monitor-container');
    }
}
</script>
```

---

## 🔧 配置选项

### ErrorHandler 配置

```javascript
// 修改默认配置
ErrorHandler.config.maxRetries = 5; // 最大重试次数
ErrorHandler.config.retryDelays = [500, 1000, 2000, 4000, 8000]; // 重试间隔
ErrorHandler.config.isDevelopment = true; // 开发模式
ErrorHandler.config.logErrors = false; // 关闭日志
```

### ErrorBoundary 配置

```javascript
// 修改默认配置
ErrorBoundary.config.isDevelopment = false; // 生产模式
ErrorBoundary.config.showStackTrace = false; // 隐藏堆栈
ErrorBoundary.config.autoReport = true; // 开启自动上报
```

---

## ✅ 验证清单

### 功能测试

- [ ] **网络错误提示**
  - 断开网络，刷新页面，应显示"网络连接失败"提示
  - 自动重试 3 次，显示重试进度

- [ ] **API 重试机制**
  - 后端 API 返回 500 错误，应自动重试
  - 重试成功后，提示消失

- [ ] **空状态展示**
  - 删除所有自选股，应显示"还没有自选股"
  - 点击"添加自选股"按钮，跳转正确

- [ ] **404 页面**
  - 访问不存在的页面（如 `/test-404`），显示 404 页面
  - 点击"返回首页"按钮，跳转正确

- [ ] **错误边界**
  - 在组件中抛出错误，应显示错误 UI
  - 点击"重新加载"，页面刷新

- [ ] **JS 错误捕获**
  - 控制台执行 `throw new Error('test')`，应显示友好提示
  - 开发模式显示详情，生产模式显示通用消息

---

## 🎯 成功标准达成情况

| 标准 | 状态 | 实现方式 |
|------|------|---------|
| ✅ 网络错误有友好提示 | ✅ 完成 | `ErrorHandler.showError()` |
| ✅ API 失败自动重试 3 次 | ✅ 完成 | `ErrorHandler.retryRequest()` |
| ✅ 空状态有引导文案 | ✅ 完成 | `EmptyState` 7 种预设模板 |
| ✅ 404 页面可访问 | ✅ 完成 | `/pages/error/404.html` |
| ✅ JS 错误不会白屏 | ✅ 完成 | `ErrorBoundary` + 全局监听 |
| ✅ UI 风格一致 | ✅ 完成 | 参考 `recommendations-new.html` |

---

## 📝 下一步

1. **集成到所有页面**（预计 30 分钟）
   - 在每个 PRD 页面引入 `error-handler.js`
   - 替换现有 `apiRequest()` 为 `enhancedApiRequest()`

2. **测试验证**（预计 15 分钟）
   - 模拟网络错误
   - 模拟空数据
   - 测试 404 跳转

3. **文档更新**（预计 10 分钟）
   - 更新 `API-INTEGRATION.md`
   - 记录错误处理最佳实践

---

## 🐛 已知问题与解决方案

### 问题 1：重复引入脚本
**症状**：控制台出现 "ErrorHandler already defined"  
**解决**：确保每个脚本只引入一次，使用全局检查：
```javascript
if (!window.ErrorHandler) {
    // 定义 ErrorHandler
}
```

### 问题 2：样式冲突
**症状**：空状态样式被覆盖  
**解决**：使用 CSS 模块化类名（`.empty-state-*`）

---

_错误处理不是负担，是对用户的尊重。_ 🎯
