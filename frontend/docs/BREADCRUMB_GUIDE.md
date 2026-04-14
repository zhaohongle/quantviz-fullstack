# 面包屑导航使用指南

## 概述

面包屑导航（Breadcrumb Navigation）是一种显示用户在网站中位置的导航方式，形如：

```
首页 > AI推荐 > 推荐详情
```

在 QuantViz 中，面包屑导航位于顶部导航正下方，提供快速返回上级的功能。

---

## 设计原则

### 1. 简洁性
- 层级不超过 3 级
- 每级名称 2-6 个字符
- 使用 `>` 或 `›` 作为分隔符

### 2. 可点击性
- 除当前页面外，所有层级可点击
- 点击后返回对应层级
- 悬停时显示视觉反馈

### 3. 一致性
- 所有页面的面包屑格式统一
- 分隔符样式一致
- 颜色遵循主题

---

## 实现方式

### 配置面包屑

在 `js/router.js` 的频道配置中设置：

```javascript
'ai-recommendations': {
    title: 'AI推荐',
    url: 'pages/prd3/recommendations-new.html',
    breadcrumb: ['首页', 'AI推荐']  // 👈 面包屑配置
}
```

### 面包屑数组规则

- **第一项**：必须是 `'首页'`（除非在首页本身）
- **最后一项**：当前页面名称（不可点击）
- **中间项**：可选的中间层级

---

## 层级结构示例

### 一级页面（频道首页）

```javascript
breadcrumb: ['首页']
```

**渲染结果**：
```
首页 > 首页
```

---

### 二级页面（频道内容页）

```javascript
breadcrumb: ['首页', 'AI推荐']
```

**渲染结果**：
```
首页 > AI推荐
```

---

### 三级页面（详情页）

```javascript
breadcrumb: ['首页', 'AI推荐', '推荐详情']
```

**渲染结果**：
```
首页 > AI推荐 > 推荐详情
```

---

## 样式定制

### 基础样式

```css
.breadcrumb {
    background: var(--bg-card);
    padding: 12px 32px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
}

.breadcrumb-item {
    color: var(--text-sec);        /* 次要文字颜色 */
    text-decoration: none;
    transition: var(--transition-fast);
    cursor: pointer;
}

.breadcrumb-item:hover {
    color: var(--primary);         /* 悬停时主色调 */
}

.breadcrumb-item.active {
    color: var(--text);            /* 当前页面主文字色 */
    font-weight: 500;
    cursor: default;
}

.breadcrumb-separator {
    color: var(--text-dim);        /* 分隔符颜色 */
    user-select: none;
}
```

### 自定义分隔符

#### 使用箭头 `>`

```html
<span class="breadcrumb-separator">></span>
```

#### 使用右箭头 `›`

```html
<span class="breadcrumb-separator">›</span>
```

#### 使用斜杠 `/`

```html
<span class="breadcrumb-separator">/</span>
```

#### 使用图标

```html
<span class="breadcrumb-separator">
    <svg>...</svg>
</span>
```

---

## 交互行为

### 点击返回

当前实现（简化版）：

```javascript
updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumbContainer');
    
    const html = items.map((item, index) => {
        // 最后一项（当前页面）不可点击
        if (index === items.length - 1) {
            return `<span class="breadcrumb-item active">${item}</span>`;
        }
        
        // 其他项可点击返回首页
        return `
            <a class="breadcrumb-item" onclick="router.navigate('home')">${item}</a>
            <span class="breadcrumb-separator">›</span>
        `;
    }).join('');

    breadcrumb.innerHTML = html;
}
```

### 完整实现（推荐）

支持点击任意层级返回：

```javascript
updateBreadcrumb(items, channelPath) {
    const breadcrumb = document.getElementById('breadcrumbContainer');
    
    const html = items.map((item, index) => {
        // 最后一项（当前页面）
        if (index === items.length - 1) {
            return `<span class="breadcrumb-item active">${item}</span>`;
        }
        
        // 确定点击后要导航到的频道
        let targetChannel = 'home';
        if (index === 1 && channelPath) {
            targetChannel = channelPath; // 二级点击返回对应频道
        }
        
        return `
            <a class="breadcrumb-item" onclick="router.navigate('${targetChannel}')">${item}</a>
            <span class="breadcrumb-separator">›</span>
        `;
    }).join('');

    breadcrumb.innerHTML = html;
}
```

---

## 高级功能

### 动态面包屑

根据页面状态动态更新面包屑：

```javascript
// 页面内调用
function updatePageBreadcrumb(subPage) {
    const currentChannel = router.getCurrentChannel();
    const config = channels[currentChannel];
    
    // 添加子页面到面包屑
    const newBreadcrumb = [...config.breadcrumb, subPage];
    router.updateBreadcrumb(newBreadcrumb);
}

// 使用示例
updatePageBreadcrumb('推荐详情');
// 结果：首页 > AI推荐 > 推荐详情
```

### 带参数的面包屑

显示动态内容（如股票名称）：

```javascript
// 例如：首页 > 市场数据 > 贵州茅台(600519)
const stockName = '贵州茅台(600519)';
updatePageBreadcrumb(stockName);
```

### 面包屑截断

层级过多时自动截断：

```javascript
function truncateBreadcrumb(items, maxItems = 4) {
    if (items.length <= maxItems) {
        return items;
    }
    
    // 保留首页、最后一项，中间用 ... 代替
    return [
        items[0],
        '...',
        items[items.length - 1]
    ];
}
```

---

## 响应式适配

### 桌面端

```css
.breadcrumb {
    padding: 12px 32px;
    font-size: 13px;
}
```

### 移动端

```css
@media (max-width: 768px) {
    .breadcrumb {
        padding: 10px 16px;
        font-size: 12px;
    }
    
    .breadcrumb-inner {
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
    }
    
    .breadcrumb-inner::-webkit-scrollbar {
        display: none;
    }
}
```

### 超小屏幕

```css
@media (max-width: 480px) {
    .breadcrumb {
        padding: 8px 12px;
        font-size: 11px;
    }
    
    /* 隐藏中间层级，仅保留首/末 */
    .breadcrumb-item:not(:first-child):not(:last-child),
    .breadcrumb-separator:not(:last-of-type) {
        display: none;
    }
}
```

---

## 可访问性（A11y）

### 语义化标签

```html
<nav class="breadcrumb" aria-label="面包屑导航">
    <ol class="breadcrumb-inner">
        <li><a href="#home">首页</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">AI推荐</li>
    </ol>
</nav>
```

### 键盘导航

```javascript
// 支持 Tab 键导航
breadcrumbItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});
```

### 屏幕阅读器支持

```html
<a class="breadcrumb-item" 
   aria-label="返回首页"
   onclick="router.navigate('home')">
    首页
</a>
```

---

## 最佳实践

### ✅ 推荐做法

1. **保持简洁**：层级不超过 3 级
2. **清晰命名**：每级名称简短明了
3. **视觉反馈**：悬停/点击有明显变化
4. **一致性**：全站面包屑格式统一
5. **移动优化**：小屏幕下适当简化

### ❌ 避免做法

1. **层级过深**：超过 4 级难以阅读
2. **名称过长**：影响布局和可读性
3. **不可点击**：面包屑应支持快速返回
4. **颜色混乱**：与主题不一致
5. **重复内容**：与顶部导航完全重复

---

## 常见问题

### Q1: 面包屑不更新？

**检查**：
1. 频道配置中 `breadcrumb` 字段是否存在
2. `updateBreadcrumb` 方法是否被调用
3. 容器 `#breadcrumbContainer` 是否存在

### Q2: 点击返回无效？

**检查**：
1. `onclick` 事件是否正确绑定
2. 目标频道 ID 是否正确
3. 浏览器控制台是否有错误

### Q3: 移动端面包屑溢出？

**解决**：
```css
.breadcrumb-inner {
    overflow-x: auto;
    white-space: nowrap;
}
```

### Q4: 面包屑样式与主题不符？

**检查**：
1. 是否正确引入 `dark-theme.css`
2. CSS 变量是否被覆盖
3. 检查浏览器开发者工具中的计算样式

---

## 示例代码

### 完整示例：三级面包屑

```html
<!-- HTML -->
<nav class="breadcrumb" aria-label="面包屑导航">
    <div class="breadcrumb-inner" id="breadcrumbContainer">
        <a class="breadcrumb-item" onclick="router.navigate('home')">首页</a>
        <span class="breadcrumb-separator">›</span>
        <a class="breadcrumb-item" onclick="router.navigate('ai-recommendations')">AI推荐</a>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-item active">推荐详情</span>
    </div>
</nav>
```

```javascript
// JavaScript
const breadcrumb = ['首页', 'AI推荐', '推荐详情'];
router.updateBreadcrumb(breadcrumb);
```

---

## 扩展阅读

- [面包屑导航 - Nielsen Norman Group](https://www.nngroup.com/articles/breadcrumbs/)
- [WAI-ARIA 面包屑模式](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [Material Design 面包屑](https://material.io/components/breadcrumbs)

---

_最后更新：2026-04-14_
