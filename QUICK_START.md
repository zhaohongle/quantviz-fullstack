# 🚀 AI 推荐引擎 - 快速启动指南

## 一键启动（推荐）

### macOS / Linux
```bash
# 1. 进入项目目录
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack

# 2. 运行演示脚本（测试所有功能）
./demo-ai-engine.sh

# 3. 启动服务器（分两个终端窗口）

# 终端 1 - 启动后端
cd backend
node server.js

# 终端 2 - 启动前端
cd frontend
python3 -m http.server 8080

# 4. 打开浏览器访问
open http://localhost:8080/pages/prd3/recommendations-new.html
```

---

## 分步启动

### Step 1: 测试后端功能
```bash
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack
./demo-ai-engine.sh
```

预期输出：
```
✅ 生成推荐数量: 6 只
✅ 30 天准确率: 74.1%
✅ 所有测试通过！
```

### Step 2: 启动后端 API 服务器
```bash
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/backend
node server.js
```

预期输出：
```
✅ QuantViz API Server 已启动！
   地址: http://localhost:3000
   健康检查: http://localhost:3000/api/health
```

**保持这个终端窗口打开**，不要关闭。

### Step 3: 启动前端服务器（新终端窗口）
```bash
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/frontend
python3 -m http.server 8080
```

预期输出：
```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

**保持这个终端窗口打开**，不要关闭。

### Step 4: 访问页面

打开浏览器，访问以下页面：

1. **推荐列表页**  
   http://localhost:8080/pages/prd3/recommendations-new.html
   
   功能测试：
   - [ ] 切换风险偏好（保守型 / 平衡型 / 激进型）
   - [ ] 查看推荐卡片（应该显示 6 只股票）
   - [ ] 点击任意卡片，跳转到详情页

2. **推荐详情页**  
   http://localhost:8080/pages/prd3/recommendation-detail.html?code=600519
   
   功能测试：
   - [ ] 查看 5-7 条推荐理由
   - [ ] 查看 3-4 条风险提示
   - [ ] 查看止损价建议

3. **准确率追踪页**  
   http://localhost:8080/pages/prd3/accuracy.html
   
   功能测试：
   - [ ] 查看 30/60/90 天准确率
   - [ ] 查看分类准确率
   - [ ] 查看趋势图表

---

## 测试 API 接口（可选）

### 测试准确率接口
```bash
curl http://localhost:3000/api/recommendations/accuracy | jq
```

### 测试推荐列表（平衡型）
```bash
curl "http://localhost:3000/api/recommendations?risk=medium" | jq
```

### 测试推荐列表（保守型）
```bash
curl "http://localhost:3000/api/recommendations?risk=low" | jq
```

### 测试推荐详情
```bash
curl "http://localhost:3000/api/recommendations/detailed/600519" | jq
```

---

## 常见问题

### Q1: 报错 "Cannot find module"
**解决方法**：安装依赖
```bash
cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack/backend
npm install
```

### Q2: 前端页面空白
**原因**：后端服务器没有启动  
**解决方法**：检查后端是否正常运行（Step 2）

### Q3: API 返回 404
**原因**：访问了错误的接口  
**解决方法**：使用正确的接口路径：
- `/api/recommendations` - 推荐列表
- `/api/recommendations/detailed/:code` - 推荐详情
- `/api/recommendations/accuracy` - 准确率统计

### Q4: 端口被占用
**解决方法**：更换端口
```bash
# 后端（默认 3000）
PORT=3001 node server.js

# 前端（默认 8080）
python3 -m http.server 8081
```

---

## 停止服务器

在对应的终端窗口按 `Ctrl + C` 停止服务器。

---

## 下一步

### 部署到生产环境

1. **替换推荐页面**
   ```bash
   cd frontend/pages/prd3
   mv recommendations.html recommendations-old.html
   mv recommendations-new.html recommendations.html
   ```

2. **部署到 Vercel**
   ```bash
   cd /Users/qihoo/.openclaw/workspace/alex-pm/quantviz-fullstack
   vercel --prod
   ```

3. **验证生产环境**
   - 访问：https://quantviz-fullstack-nkxq.vercel.app/pages/prd3/recommendations.html

---

## 文档索引

- 📋 **完整测试文档**: `AI_RECOMMENDATION_ENGINE_DELIVERY.md`
- 📊 **最终交付报告**: `FINAL_DELIVERY_REPORT.md`
- 🎬 **演示脚本**: `demo-ai-engine.sh`

---

**问题反馈**: 如有问题，请检查终端输出的错误信息。
