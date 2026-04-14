# QuantViz 导航系统说明

## 概述

QuantViz 导航系统采用 **SPA（单页应用）架构**，实现了：
- ✅ 常驻顶部导航（固定在页面顶部）
- ✅ 无刷新频道切换
- ✅ 二级面包屑导航
- ✅ 统一暗黑主题
- ✅ 玻璃态效果
- ✅ 平滑切换动画

---

## 系统架构

### 核心文件

```
quantviz-fullstack/frontend/
├── app-v2.html              # 新版主应用（入口文件）
├── js/
│   └── router.js            # 路由系统（频道切换逻辑）
├── css/
│   ├── dark-theme.css       # 暗黑主题基础样式
│   └── navigation.css       # 导航专属样式
└── pages/                   # 各频道页面内容
    ├── home-redesign.html
    ├── prd3/recommendations-new.html
    ├── filter/smart-filter.html
    ├── stocks/kline.html
    ├── watchlist/index.html
    └── settings/index.html
```

---

## 使用方法

### 启动应用

在浏览器中打开：
```
http://localhost:8080/app-v2.html
```

或使用服务器：
```bash
cd quantviz-fullstack/frontend
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/app-v2.html`

---

## 频道配置

### 当前频道

| 频道名称 | 频道ID | 页面路径 | 面包屑 |
|---------|--------|---------|-------|
| 首页 | `home` | `pages/home-redesign.html` | 首页 |
| AI推荐 | `ai-recommendations` | `pages/prd3/recommendations-new.html` | 首页 > AI推荐 |
| 智能筛选 | `smart-filter` | `pages/filter/smart-filter.html` | 首页 > 智能筛选 |
| 市场数据 | `market-data` | `pages/stocks/kline.html` | 首页 > 市场数据 |
| 自选股 | `watchlist` | `pages/watchlist/index.html` | 首页 > 自选股 |
| 设置 | `settings` | `pages/settings/index.html` | 首页 > 设置 |

### 添加新频道

编辑 `js/router.js`，在 `channels` 对象中添加：

```javascript
const channels = {
    // ... 现有频道
    'new-channel': {
        title: '新频道标题',
        url: 'pages/new-channel/index.html',
        breadcrumb: ['首页', '新频道标题']
    }
};
```

然后在 `app-v2.html` 的导航栏中添加：

```html
<a class="nav-item" data-channel="new-channel">新频道标题</a>
```

---

## 导航系统功能

### 1. 常驻顶部导航

- **固定位置**：使用 `position: sticky` 保持在视口顶部
- **玻璃态效果**：`backdrop-filter: blur(16px)` + 半透明背景
- **激活状态**：当前频道高亮显示（蓝色下划线）
- **响应式**：自适应不同屏幕尺寸

### 2. 面包屑导航

- **位置**：顶部导航正下方
- **格式**：`首页 > 当前频道 > 当前页面`
- **交互**：点击可返回上级（当前仅支持返回首页）
- **动态更新**：频道切换时自动更新

### 3. 内容切换

- **无刷新加载**：使用 `fetch` API 动态加载内容
- **平滑动画**：淡入淡出效果（300ms）
- **内容提取**：自动移除原页面的导航栏
- **脚本执行**：自动执行新内容中的 JavaScript
- **缓存机制**：最近访问的 5 个频道内容被缓存

### 4. 加载状态

- **加载覆盖层**：频道切换时显示加载动画
- **错误提示**：加载失败时显示错误 Toast
- **自动隐藏**：加载完成后自动消失

---

## 技术特性

### 路由系统 (`router.js`)

```javascript
// 导航到频道
router.navigate('ai-recommendations');

// 获取当前频道
const current = router.getCurrentChannel();

// 清除缓存
router.clearCache();
```

### 内容提取

路由系统会自动移除原页面中的以下元素：
- `.navbar` / `nav.navbar`
- `.top-nav`
- `header`
- `.breadcrumb`

保留：
- `main` 标签内容
- `.container` / `.content` 内容
- 所有样式和脚本

### 缓存机制

- **最大缓存数**：5 个频道
- **缓存策略**：LRU（最近最少使用）
- **手动清除**：`router.clearCache()`

---

## 样式定制

### 颜色变量（继承自 `dark-theme.css`）

```css
--primary: #00d4ff;         /* 主色调 */
--bg: #0a0e17;              /* 背景色 */
--bg-card: #12161f;         /* 卡片背景 */
--text: #e0e7f1;            /* 主文字 */
--text-sec: #8b95a5;        /* 次要文字 */
--border: rgba(255, 255, 255, 0.08);  /* 边框 */
```

### 自定义导航样式

编辑 `css/navigation.css`：

```css
/* 修改导航高度 */
.top-nav {
    padding: 16px 32px;  /* 默认 12px 32px */
}

/* 修改激活颜色 */
.nav-item.active {
    color: #ff6b6b;  /* 默认 var(--primary) */
    border-bottom-color: #ff6b6b;
}
```

---

## 响应式断点

| 屏幕宽度 | 导航布局 | 说明 |
|---------|---------|------|
| > 1200px | 完整展示 | 所有元素正常显示 |
| 768px - 1200px | 紧凑模式 | 缩小间距和字体 |
| < 768px | 移动模式 | 导航项可横向滚动 |
| < 480px | 超小模式 | 进一步缩小元素 |

---

## 浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|-------|---------|------|
| Chrome | 90+ | 完全支持 |
| Firefox | 88+ | 完全支持 |
| Safari | 14+ | 完全支持 |
| Edge | 90+ | 完全支持 |

**不支持**：IE 11 及以下版本

---

## 性能优化

### 已实现

- ✅ 内容缓存（减少重复加载）
- ✅ 平滑动画（300ms 内完成）
- ✅ 懒加载脚本（仅加载当前频道所需脚本）
- ✅ CSS 分离（导航样式独立文件）

### 建议优化

- 📋 图片懒加载（IntersectionObserver）
- 📋 虚拟滚动（长列表优化）
- 📋 Service Worker（离线支持）
- 📋 代码分割（Webpack/Vite）

---

## 调试工具

### 控制台命令

```javascript
// 查看当前频道
console.log(router.getCurrentChannel());

// 查看缓存内容
console.log(router.contentCache);

// 清除缓存
router.clearCache();

// 手动导航
router.navigate('settings');

// 查看频道配置
console.log(channels);
```

### Chrome DevTools

1. 打开 Network 面板查看加载请求
2. 勾选 "Disable cache" 测试无缓存性能
3. 使用 Performance 面板分析动画性能

---

## 常见问题

### Q1: 频道切换后样式丢失？

**原因**：原页面的样式可能使用了相对路径  
**解决**：统一使用绝对路径或修改 `<base>` 标签

### Q2: 脚本不执行？

**原因**：`innerHTML` 不会自动执行 `<script>`  
**解决**：路由系统已自动处理，检查控制台错误

### Q3: 面包屑不更新？

**原因**：频道配置中 `breadcrumb` 字段缺失  
**解决**：在 `channels` 中补充 `breadcrumb` 数组

### Q4: 移动端导航溢出？

**原因**：导航项过多，超出屏幕宽度  
**解决**：已设置横向滚动，或使用汉堡菜单

---

## 后续优化计划

### Phase 4（未来迭代）

- [ ] URL hash 持久化（刷新后恢复当前频道）
- [ ] 浏览器前进/后退支持
- [ ] 移动端汉堡菜单
- [ ] 搜索功能集成
- [ ] 主题切换（明/暗模式）
- [ ] 键盘快捷键（Ctrl+1~6 切换频道）
- [ ] 页面预加载（鼠标悬停时提前加载）

---

## 联系方式

如有问题或建议，请联系：
- 📧 Email: support@quantviz.com
- 💬 Issue: GitHub Issues

---

_最后更新：2026-04-14_
