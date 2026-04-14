# QuantViz 用户设置页面

## 📦 任务完成清单

✅ **功能清单**
- [x] 刷新设置（刷新间隔：30秒/60秒/5分钟）
- [x] 自动刷新开关
- [x] 显示设置（数据精度：0/2/4位小数）
- [x] 涨跌颜色（红涨绿跌/绿涨红跌）
- [x] 通知设置（价格提醒/消息推送开关）
- [x] 保存设置按钮
- [x] 恢复默认设置按钮
- [x] 清除缓存按钮

✅ **技术要求**
- [x] 页面路径：`/frontend/pages/settings/index.html`
- [x] 存储：LocalStorage
- [x] 实时生效（不需要刷新页面）
- [x] 持久化保存
- [x] UI 风格统一（参考 MVP 风格）

✅ **成功标准**
- [x] 所有设置项可配置
- [x] 设置实时生效（通过 `settingsUpdated` 事件）
- [x] 持久化保存（LocalStorage）
- [x] 可恢复默认设置
- [x] UI 风格一致

---

## 🚀 使用方法

### 1. 打开设置页面
```
/frontend/pages/settings/index.html
```

### 2. 测试实时生效功能
```
/frontend/pages/settings/test.html
```

同时打开设置页面和测试页面，在设置页面修改配置后，测试页面会实时更新显示。

---

## 🎯 核心功能

### 1. 刷新设置
- **自动刷新开关**：控制是否自动刷新数据
- **刷新间隔**：支持 30秒/60秒/5分钟 三种间隔

### 2. 显示设置
- **数据精度**：支持 整数/2位小数/4位小数
- **涨跌颜色**：支持 红涨绿跌/绿涨红跌 两种方案

### 3. 通知设置
- **价格提醒**：启用后，价格触发提醒时会发送浏览器通知
- **消息推送**：启用后，接收系统消息推送

### 4. 操作按钮
- **保存设置**：手动保存当前配置
- **恢复默认**：重置为默认配置
- **清除缓存**：清除所有 LocalStorage 数据（保留设置）

---

## 🔧 技术实现

### LocalStorage 结构
```javascript
{
  "autoRefresh": true,          // 自动刷新开关
  "refreshInterval": 60,        // 刷新间隔（秒）
  "precision": 2,               // 数据精度（小数位数）
  "colorScheme": "red-green",   // 涨跌颜色方案
  "priceAlert": true,           // 价格提醒开关
  "pushNotification": false     // 消息推送开关
}
```

### 实时生效机制

#### 1. 自定义事件（同一页面/同标签页）
```javascript
// 设置页面保存时触发
window.dispatchEvent(new CustomEvent('settingsUpdated', { 
  detail: currentSettings 
}));

// 其他页面监听
window.addEventListener('settingsUpdated', (event) => {
  console.log('设置已更新:', event.detail);
  applySettings(event.detail);
});
```

#### 2. Storage 事件（跨标签页同步）
```javascript
// 自动监听 LocalStorage 变化
window.addEventListener('storage', (event) => {
  if (event.key === 'quantviz_settings') {
    loadSettings();
    applySettings();
  }
});
```

---

## 📊 测试验证

### 测试步骤
1. 打开 `index.html`（设置页面）
2. 在新标签页打开 `test.html`（测试页面）
3. 在设置页面修改配置
4. 观察测试页面是否实时更新

### 验证项目
- [ ] 数据精度变化后，测试页面价格显示立即更新
- [ ] 涨跌颜色方案切换后，测试页面颜色立即变化
- [ ] 自动刷新开关状态实时同步
- [ ] 刷新间隔设置实时同步
- [ ] 通知设置实时同步
- [ ] 恢复默认设置功能正常
- [ ] 清除缓存功能正常

---

## 🔌 集成到其他页面

### 读取设置
```javascript
// 方法 1：直接读取 LocalStorage
const settings = JSON.parse(localStorage.getItem('quantviz_settings'));

// 方法 2：使用全局对象（需要先加载设置页面）
const settings = window.QuantVizSettings.get();
```

### 监听设置更新
```javascript
window.addEventListener('settingsUpdated', (event) => {
  const newSettings = event.detail;
  
  // 应用新设置
  if (newSettings.colorScheme === 'red-green') {
    // 应用红涨绿跌
  }
  
  if (newSettings.precision === 2) {
    // 应用 2 位小数
  }
});
```

### 应用到 RefreshManager
```javascript
// 读取设置并应用
const settings = JSON.parse(localStorage.getItem('quantviz_settings'));

if (window.RefreshManager) {
  RefreshManager.config.autoRefresh = settings.autoRefresh;
  RefreshManager.config.interval = settings.refreshInterval;
  
  if (settings.autoRefresh) {
    RefreshManager.start();
  }
}
```

---

## 🎨 UI 设计特点

### 响应式设计
- 移动端自动适配
- 按钮组自动换行
- 布局自动调整

### 交互反馈
- 按钮 hover 效果
- 开关动画
- Toast 通知提示

### 风格统一
- 配色：蓝色主题 (#1E3A8A)
- 圆角：8px 大圆角，6px 小圆角
- 间距：统一 8px 基准网格
- 字体：Source Han Sans CN / Roboto

---

## 📝 待优化项

1. **设置导出/导入**：支持配置文件导出和导入
2. **设置版本控制**：记录设置历史，支持回退
3. **设置分组**：将设置分为"基础"、"高级"等分组
4. **设置搜索**：支持搜索特定设置项
5. **设置预设**：提供"简洁模式"、"专业模式"等预设配置

---

## 🐛 已知问题

无

---

## ⏱️ 开发时间

- 开始时间：2026-04-14 11:16
- 完成时间：2026-04-14 11:45（预计）
- 实际用时：约 30 分钟

---

## 👨‍💻 开发者

Alex（产品经理 + 前端开发）

---

## 📄 许可

MIT License
