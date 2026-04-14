# QuantViz 全局搜索功能 - 快速验证指南

## 🚀 立即验证

### 1. 启动后端（如果未启动）
```bash
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/backend
node server.js
```

等待看到：
```
✅ QuantViz API Server 已启动！
   地址: http://localhost:3000
```

---

### 2. 打开前端应用
浏览器访问：`http://localhost:3000/app.html`

（或者直接打开文件：`/Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/frontend/app.html`）

---

### 3. 测试搜索功能

#### 测试 1：股票代码搜索
1. 在顶部导航栏找到搜索框
2. 输入：`600519`
3. ✅ 应该看到"贵州茅台"出现在下拉建议中

#### 测试 2：股票名称搜索
1. 清空搜索框
2. 输入：`茅台`
3. ✅ 应该看到"贵州茅台"出现在下拉建议中

#### 测试 3：拼音首字母搜索
1. 清空搜索框
2. 输入：`gzmt`
3. ✅ 应该看到"贵州茅台"出现在下拉建议中

#### 测试 4：搜索历史
1. 点击搜索框（不输入任何内容）
2. ✅ 应该看到"搜索历史"部分显示之前搜索过的股票

#### 测试 5：搜索结果页
1. 在搜索框输入：`茅台`
2. 按回车键
3. ✅ 应该跳转到 `/pages/search/index.html?q=茅台`
4. ✅ 页面显示搜索结果（股票卡片）

---

## 🧪 后端 API 测试

### 测试搜索建议接口
```bash
curl "http://localhost:3000/api/search/suggestions?q=600519"
```

期望响应：
```json
{
  "success": true,
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "market": "SH",
      "price": 1440.17,
      "changePercent": -0.22,
      "relevanceScore": 100
    }
  ],
  "count": 1,
  "query": "600519",
  "timestamp": 1776133130852
}
```

### 测试拼音搜索
```bash
curl "http://localhost:3000/api/search/suggestions?q=gzmt"
```

期望响应：
```json
{
  "success": true,
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "market": "SH",
      "price": 1440.17,
      "changePercent": -0.22,
      "relevanceScore": 80
    }
  ],
  "count": 1,
  "query": "gzmt",
  "timestamp": 1776133151025
}
```

---

## 📸 期望效果

### 搜索框外观
- 位置：顶部导航栏中间（导航链接和主题按钮之间）
- 样式：白色半透明背景，蓝色聚焦边框
- 占位符：`搜索股票代码/名称/拼音...`

### 搜索建议下拉框
- 背景：白色卡片
- 阴影：柔和阴影
- 内容：
  - 股票名称（粗体）
  - 股票代码（灰色、等宽字体）
  - 价格（右侧）
  - 涨跌幅（红色上涨/绿色下跌）

### 搜索结果页
- 标题：`搜索：茅台`
- 元信息：`找到 1 个结果`
- 股票卡片：
  - 左侧：股票名称 + 代码
  - 右侧：价格 + 涨跌幅
  - 底部：今开、最高、最低、成交额

---

## ✅ 验收清单

- [ ] 搜索框已集成到导航栏（不破坏现有布局）
- [ ] 输入时实时显示搜索建议（下拉列表）
- [ ] 支持股票代码搜索（如 `600519`）
- [ ] 支持股票名称搜索（如 `茅台`）
- [ ] 支持拼音首字母搜索（如 `gzmt`）
- [ ] 点击搜索建议跳转到搜索结果页
- [ ] 搜索历史保存在 LocalStorage
- [ ] UI 风格与现有页面一致（MVP 蓝白风格）

---

## 🐛 常见问题

### Q: 搜索框不显示？
**A**: 检查浏览器控制台，确认 `/components/search-box.html` 加载成功。

### Q: 搜索无结果？
**A**: 确认后端服务已启动（访问 `http://localhost:3000/api/health`）。

### Q: 拼音搜索不准确？
**A**: 当前仅支持预设的常见股票拼音映射，未来可扩展为完整拼音库。

---

## 📞 联系开发者

如有问题，请联系 **Alex (Subagent)**

**完成时间**：2026-04-14 10:20  
**预计完成时间**：13:15（提前 3 小时完成）
