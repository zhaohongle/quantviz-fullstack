# QuantViz 频道配置文档

## 频道配置结构

每个频道在 `js/router.js` 的 `channels` 对象中定义，格式如下：

```javascript
'channel-id': {
    title: '频道标题',           // 显示在页面标题
    url: '页面文件路径',         // 相对于 frontend/ 根目录
    breadcrumb: ['层级1', '层级2']  // 面包屑导航路径
}
```

---

## 当前频道清单

### 1. 首页（Home）

```javascript
'home': {
    title: '首页',
    url: 'pages/home-redesign.html',
    breadcrumb: ['首页']
}
```

**功能**：
- 市场指数概览（上证、深证、创业板、科创板）
- AI 精选推荐股票
- 市场热点分析
- 快速入口（筛选、自选、设置）

**页面特点**：
- 卡片式布局
- 实时数据更新
- 玻璃态效果

---

### 2. AI 推荐（AI Recommendations）

```javascript
'ai-recommendations': {
    title: 'AI推荐',
    url: 'pages/prd3/recommendations-new.html',
    breadcrumb: ['首页', 'AI推荐']
}
```

**功能**：
- AI 分析的精选股票推荐
- 风险偏好筛选（保守/稳健/进取）
- 推荐理由详解
- 准确率统计
- 历史推荐记录

**数据来源**：
- AI 模型分析
- 技术指标评分
- 基本面评估

---

### 3. 智能筛选（Smart Filter）

```javascript
'smart-filter': {
    title: '智能筛选',
    url: 'pages/filter/smart-filter.html',
    breadcrumb: ['首页', '智能筛选']
}
```

**功能**：
- 多维度筛选条件
  - 市值范围
  - PE/PB 区间
  - ROE/毛利率
  - 涨跌幅
  - 成交量
- 预设筛选方案
- 自定义筛选组合
- 结果导出

**高级功能**：
- 条件保存
- 筛选模板
- 实时更新

---

### 4. 市场数据（Market Data）

```javascript
'market-data': {
    title: '市场数据',
    url: 'pages/stocks/kline.html',
    breadcrumb: ['首页', '市场数据']
}
```

**功能**：
- K 线图表（日/周/月/年）
- 技术指标（MA/MACD/KDJ/RSI/BOLL）
- 成交量分析
- 分时数据
- 历史复权数据

**图表功能**：
- 缩放拖动
- 指标叠加
- 对比分析
- 数据导出

---

### 5. 自选股（Watchlist）

```javascript
'watchlist': {
    title: '自选股',
    url: 'pages/watchlist/index.html',
    breadcrumb: ['首页', '自选股']
}
```

**功能**：
- 自选股列表
- 实时涨跌提醒
- 分组管理
- 自定义排序
- 批量操作

**数据同步**：
- 本地存储
- 云端备份（如已登录）
- 多设备同步

---

### 6. 设置（Settings）

```javascript
'settings': {
    title: '设置',
    url: 'pages/settings/index.html',
    breadcrumb: ['首页', '设置']
}
```

**功能**：
- 账户设置
- 通知偏好
- 数据更新频率
- 主题切换
- 语言选择
- 缓存清理

---

## 添加新频道

### 步骤 1：创建页面文件

在 `pages/` 目录下创建新页面，例如：

```html
<!-- pages/portfolio/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资组合</title>
    <link rel="stylesheet" href="../../css/dark-theme.css">
</head>
<body>
    <main class="container">
        <h1>我的投资组合</h1>
        <!-- 页面内容 -->
    </main>
</body>
</html>
```

**注意**：
- ❌ 不要包含 `<nav>` 导航栏（会被自动移除）
- ✅ 使用 `<main>` 或 `.container` 包裹主内容
- ✅ 样式路径使用相对路径（相对于页面文件位置）

---

### 步骤 2：注册频道配置

编辑 `js/router.js`，添加新频道：

```javascript
const channels = {
    // ... 现有频道
    'portfolio': {
        title: '投资组合',
        url: 'pages/portfolio/index.html',
        breadcrumb: ['首页', '投资组合']
    }
};
```

---

### 步骤 3：添加导航项

编辑 `app-v2.html`，在 `.nav-items` 中添加：

```html
<div class="nav-items" id="navItems">
    <!-- 现有导航项 -->
    <a class="nav-item" data-channel="portfolio">投资组合</a>
</div>
```

---

### 步骤 4：测试

1. 刷新页面
2. 点击新导航项
3. 检查内容是否正确加载
4. 检查面包屑是否更新

---

## 频道类型分类

### 核心频道（P0）

必须保持可用的频道：
- ✅ 首页
- ✅ AI 推荐
- ✅ 智能筛选

### 功能频道（P1）

常用功能频道：
- ✅ 市场数据
- ✅ 自选股

### 辅助频道（P2）

辅助功能频道：
- ✅ 设置

---

## 频道命名规范

### ID 命名

- **格式**：小写字母 + 连字符
- **示例**：`ai-recommendations`、`smart-filter`
- **避免**：驼峰命名、下划线、中文

### 标题命名

- **格式**：简洁明了的中文
- **长度**：2-6 个字符
- **示例**：`AI推荐`、`智能筛选`

### 面包屑命名

- **格式**：`['首页', '一级频道', '二级页面']`
- **层级**：最多 3 级
- **示例**：`['首页', 'AI推荐', '推荐详情']`

---

## 频道路径规范

### 目录结构

```
pages/
├── home-redesign.html          # 首页（特殊，放在 pages/ 根目录）
├── prd3/                        # AI 推荐相关
│   ├── recommendations-new.html
│   ├── recommendation-detail.html
│   ├── history.html
│   └── accuracy.html
├── filter/                      # 筛选相关
│   ├── smart-filter.html
│   └── advanced-filter.html
├── stocks/                      # 市场数据相关
│   ├── kline.html
│   ├── realtime.html
│   └── compare.html
├── watchlist/                   # 自选股相关
│   ├── index.html
│   └── group-manage.html
└── settings/                    # 设置相关
    ├── index.html
    ├── account.html
    └── notification.html
```

### 路径规则

- **主频道页面**：`pages/{频道名}/index.html`
- **子页面**：`pages/{频道名}/{功能名}.html`
- **共享资源**：`css/`、`js/`、`assets/`

---

## 频道依赖管理

### CSS 依赖

每个频道页面应包含：

```html
<!-- 基础暗黑主题 -->
<link rel="stylesheet" href="../../css/dark-theme.css">

<!-- 频道专属样式（可选） -->
<link rel="stylesheet" href="./custom.css">
```

### JavaScript 依赖

```html
<!-- 工具函数（如需要） -->
<script src="../../js/utils.js"></script>

<!-- 频道专属脚本 -->
<script src="./script.js"></script>
```

### 数据依赖

- **API 基地址**：`/api/v1/`
- **Mock 数据**：`/mock/{频道名}/`
- **静态资源**：`/assets/`

---

## 频道性能优化

### 加载优化

- ✅ 首屏内容优先加载
- ✅ 图片懒加载
- ✅ 脚本延迟加载（`defer`/`async`）
- ✅ CSS 内联关键样式

### 缓存策略

- **频道内容**：缓存 5 个最近访问的频道
- **静态资源**：浏览器缓存（30 天）
- **API 数据**：根据实时性要求设置 TTL

---

## 频道权限控制

### 公开频道

无需登录即可访问：
- ✅ 首页
- ✅ AI 推荐（部分功能）
- ✅ 市场数据

### 需登录频道

需要用户登录：
- ⚠️ 自选股
- ⚠️ 设置
- ⚠️ 投资组合（未来功能）

### 实现方式

在 `router.js` 的 `navigate` 方法中添加权限检查：

```javascript
async navigate(channel) {
    const config = channels[channel];
    
    // 权限检查
    if (config.requireAuth && !isUserLoggedIn()) {
        this.showError('请先登录');
        this.navigate('login');
        return;
    }
    
    // ... 正常加载流程
}
```

---

## 频道数据流

### 数据来源

| 频道 | 数据源 | 更新频率 |
|-----|-------|---------|
| 首页 | API + WebSocket | 实时 |
| AI推荐 | API | 每日更新 |
| 智能筛选 | API | 实时 |
| 市场数据 | WebSocket | 实时 |
| 自选股 | LocalStorage + API | 手动/自动 |
| 设置 | LocalStorage | 手动 |

### 数据流向

```
1. 用户点击导航 → 
2. Router 加载频道内容 → 
3. 频道页面初始化 → 
4. 请求 API 获取数据 → 
5. 渲染数据 → 
6. 监听数据更新（WebSocket）
```

---

## 故障排查

### 频道加载失败

**现象**：点击导航后显示错误 Toast

**原因**：
1. 页面文件路径错误
2. 页面文件不存在
3. 网络请求失败

**解决**：
1. 检查 `channels` 中的 `url` 路径
2. 确认文件存在
3. 查看浏览器 Network 面板

---

### 样式丢失

**现象**：频道内容样式混乱

**原因**：
1. CSS 路径错误（相对路径问题）
2. 样式被覆盖
3. `dark-theme.css` 未加载

**解决**：
1. 统一使用相对于页面文件的路径
2. 检查样式优先级
3. 确认 `<link>` 标签正确

---

### 脚本不执行

**现象**：频道功能失效

**原因**：
1. 脚本加载失败
2. 依赖库未加载
3. 语法错误

**解决**：
1. 查看控制台错误信息
2. 确认依赖顺序正确
3. 使用 `try-catch` 捕获错误

---

## 配置变更日志

### 2026-04-14（初始版本）

- ✅ 添加 6 个核心频道
- ✅ 实现 SPA 路由系统
- ✅ 统一暗黑主题
- ✅ 面包屑导航

### 未来计划

- 📋 添加「投资组合」频道
- 📋 添加「新闻资讯」频道
- 📋 添加「社区讨论」频道
- 📋 二级导航支持

---

_最后更新：2026-04-14_
