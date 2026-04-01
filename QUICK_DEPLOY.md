# 🚀 QuantViz 线上部署 - 简易指南

## ✅ 项目已准备好！

项目位置：`/Users/qihoo/Desktop/openclaw/quantviz-fullstack/`
Git提交：已完成

---

## 方案：Vercel部署（最简单，5分钟）

由于Render需要GitHub连接比较复杂，我推荐使用 **Vercel** 快速部署。

### 步骤1：创建GitHub仓库

```bash
# 如果还没推送，运行以下命令：
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack

# 在GitHub创建一个新仓库（通过网页）
# 然后执行：
git remote add origin https://github.com/YOUR_USERNAME/quantviz.git
git push -u origin main
```

### 步骤2：部署后端到Render

1. 访问 https://render.com
2. 注册/登录
3. 点击 "New+" → "Web Service"
4. 连接GitHub，选择 `quantviz` 仓库
5. 配置：
   - **Name**: quantviz-api
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
6. 点击 "Create Web Service"
7. 等待部署（2-3分钟）
8. **复制URL**，例如：`https://quantviz-api.onrender.com`

### 步骤3：部署前端到Vercel

1. 访问 https://vercel.com
2. 使用GitHub登录
3. 点击 "Add New..." → "Project"
4. 导入 `quantviz` 仓库
5. 配置：
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: 留空
   - **Output Directory**: `.`
6. 添加环境变量（Environment Variables）：
   - `API_URL` = `https://quantviz-api.onrender.com`
7. 点击 "Deploy"
8. 完成！获得域名like `https://quantviz-xxx.vercel.app`

### 步骤4：更新前端API地址

编辑 `frontend/js/api-loader.js`：

```javascript
const API_BASE = window.location.hostname.includes('vercel.app')
  ? 'https://quantviz-api.onrender.com/api'  // 替换为你的后端URL
  : window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';
```

然后推送更新：

```bash
git add frontend/js/api-loader.js
git commit -m "更新API地址"
git push
```

Vercel会自动重新部署。

---

## 🎉 完成！

访问你的Vercel域名：`https://quantviz-xxx.vercel.app`

你应该看到：
- 右上角绿点🟢 "实时数据"
- 真实的股票数据
- 每30秒自动刷新

---

## 📝 如果不想用GitHub

### 选项A：直接上传到Vercel

1. 压缩 `frontend` 文件夹
2. 在Vercel选择 "Upload" 方式
3. 拖拽上传

### 选项B：使用Vercel CLI

```bash
npm install -g vercel
cd frontend
vercel
```

---

## ⚠️ 注意事项

### Render免费套餐限制
- 15分钟无访问会休眠
- 第一次访问需要等几秒唤醒
- 解决：使用 UptimeRobot 定时ping

### CORS配置
后端已配置CORS，允许所有域名访问。生产环境建议限制为：

```javascript
// backend/server.js
app.use(cors({
  origin: 'https://quantviz-xxx.vercel.app'
}));
```

---

## 🔧 本地测试

在上传前，先本地测试：

```bash
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack
./start.sh
```

选择 "1. 完整启动"，访问 http://localhost:8080

---

## 📞 需要帮助？

查看完整文档：
- `README.md` - 项目说明
- `DEPLOY.md` - 详细部署教程
- `FINAL_DELIVERY.md` - 最终交付文档

或者告诉我遇到的问题！

---

**创建时间**：2026-04-01 19:50
**状态**：✅ 准备就绪
