# 🚀 部署步骤 - zhaohongle

## 第一步：创建GitHub仓库（2分钟）

1. 打开浏览器访问：https://github.com/new

2. 填写信息：
   - **Repository name**: `quantviz-fullstack`
   - **Description**: 实时股票数据可视化平台
   - **Public** 或 **Private**：选Public（免费部署需要）
   - **不要勾选** "Add a README file"
   - **不要勾选** "Add .gitignore"
   - **不要勾选** "Choose a license"

3. 点击 "Create repository"

4. **暂时不要关闭这个页面**，我们马上用到

---

## 第二步：推送代码（1分钟）

在终端执行以下命令：

```bash
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack

# 推送到GitHub
git push -u origin main
```

如果提示需要登录：
- 用户名：zhaohongle
- 密码：使用Personal Access Token（不是GitHub密码）

### 如何获取Personal Access Token？

如果没有token：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 点击 "Generate token"
5. **复制token**（只显示一次！）
6. 在推送时使用token作为密码

---

## 第三步：部署后端到Render（5分钟）

### 3.1 注册Render

1. 访问：https://render.com
2. 点击 "Get Started for Free"
3. 选择 "Sign up with GitHub"（推荐）
4. 授权Render访问GitHub

### 3.2 创建后端服务

1. 登录后，点击右上角 "New +"
2. 选择 "Web Service"
3. 点击 "Connect a repository"
4. 如果没看到仓库，点击 "Configure account" → 选择 `quantviz-fullstack`
5. 选择 `quantviz-fullstack` 仓库
6. 配置服务：

```
Name: quantviz-api
Region: Singapore (或其他离中国近的)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free
```

7. 点击 "Create Web Service"

8. **等待部署**（2-3分钟），状态变为 "Live"

9. **复制URL**，类似：`https://quantviz-api.onrender.com`
   - 记下这个URL！我们马上用

---

## 第四步：更新前端API地址（1分钟）

在你的电脑上执行：

```bash
cd /Users/qihoo/Desktop/openclaw/quantviz-fullstack

# 编辑API配置文件
nano frontend/js/api-loader.js
```

找到这行（大约第4行）：

```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';
```

改为（替换为你的Render URL）：

```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://quantviz-api.onrender.com/api';  // 替换为你的Render URL
```

按 `Ctrl+X`，然后按 `Y`，再按 `Enter` 保存。

提交并推送：

```bash
git add frontend/js/api-loader.js
git commit -m "更新API地址为Render后端"
git push
```

---

## 第五步：部署前端到Vercel（3分钟）

### 5.1 注册Vercel

1. 访问：https://vercel.com/signup
2. 选择 "Continue with GitHub"
3. 授权Vercel访问GitHub

### 5.2 部署前端

1. 登录后，点击 "Add New..." → "Project"
2. 在列表中找到 `quantviz-fullstack`
3. 点击 "Import"
4. 配置项目：

```
Framework Preset: Other
Root Directory: frontend
Build Command: (留空)
Output Directory: .
Install Command: (留空)
```

5. 点击 "Deploy"

6. **等待部署**（1-2分钟）

7. 部署成功后会显示：
   - ✅ Congratulations!
   - 域名：`https://quantviz-fullstack-xxx.vercel.app`

8. **点击域名访问**！

---

## ✅ 完成！检查效果

访问你的Vercel域名，应该看到：

1. **页面正常加载**（玻璃态UI，暗色主题）
2. **右上角显示** 🟢 "实时数据 · 2026-04-01 21:10:00"
3. **股票数据正常**（上证3948.55，茅台1459.44等）
4. **每30秒自动刷新**
5. **浏览器控制台**（F12）显示 "✅ API数据加载成功"

---

## 🔧 如果遇到问题

### 问题1：右上角显示红点🔴 "离线"

**原因**：前端连不上后端API

**解决**：
1. 检查Render后端是否部署成功（状态为Live）
2. 访问后端健康检查：`https://你的render域名/api/health`
3. 确认 `frontend/js/api-loader.js` 中的API地址正确

### 问题2：GitHub推送失败

**原因**：没有Personal Access Token

**解决**：
1. 访问：https://github.com/settings/tokens
2. 生成新token（勾选repo权限）
3. 使用token作为密码推送

### 问题3：Render部署失败

**查看日志**：
1. 在Render控制台点击服务
2. 查看 "Logs" 标签
3. 找到错误信息

常见原因：
- Node版本：确保使用Node 18+
- 依赖安装失败：检查网络

### 问题4：Vercel域名打不开

**检查**：
1. Vercel部署状态是否为 "Ready"
2. 尝试清除浏览器缓存
3. 换个浏览器试试

---

## 📞 需要帮助？

如果卡住了，告诉我：
1. 在哪一步遇到问题？
2. 具体的错误信息是什么？
3. 截图（如果方便的话）

---

## 🎉 部署成功后

你将拥有：
- ✅ 公网可访问的股票数据网站
- ✅ 数据自动更新（交易时间5分钟，非交易时间30分钟）
- ✅ 完全免费（Render + Vercel免费套餐）
- ✅ 自定义域名（可选）

分享你的网站：`https://quantviz-fullstack-xxx.vercel.app`

---

**开始时间**：现在
**预计耗时**：15分钟
**难度**：⭐⭐☆☆☆

开始吧！💪
