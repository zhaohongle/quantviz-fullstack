# QuantViz V2 快速启动指南

**适用对象**: 开发者、测试人员、项目负责人  
**更新日期**: 2026-04-13

---

## 🚀 快速开始（5 分钟）

### 1. 克隆仓库
```bash
git clone https://github.com/zhaohongle/quantviz-fullstack.git
cd quantviz-fullstack
git checkout feature/v2-upgrade
```

### 2. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装数据采集脚本依赖
cd ../scripts
npm install
```

### 3. 启动服务器
```bash
cd backend
npm start
```

**预期输出**:
```
🚀 服务器启动中...
⚠️  数据库连接失败，部分功能可能不可用

✅ QuantViz API V2 已启动！
   地址: http://localhost:3001
   健康检查: http://localhost:3001/api/health
   API文档: http://localhost:3001/api
```

### 4. 测试 API
```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取指数列表
curl http://localhost:3001/api/indices

# 获取资讯
curl http://localhost:3001/api/news
```

---

## 📚 项目结构

```
quantviz-fullstack/
├── backend/                 # 后端 API 服务器
│   ├── app.js              # 主服务器文件
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   └── package.json        # 依赖配置
├── scripts/                # 数据采集脚本
│   ├── fetch-data.js       # 主采集脚本
│   └── package.json        # 依赖配置
├── migrations/             # 数据库迁移脚本
│   └── v2-upgrade.sql      # V2 升级脚本
├── docs/                   # 文档
│   ├── DAY1-DELIVERY-SUMMARY.md
│   ├── DAY1-TECHNICAL-REPORT.md
│   └── DAY1-API-TEST-REPORT.md
└── frontend/               # 前端（待开发）
```

---

## 🔧 配置说明

### 环境变量（可选）

创建 `backend/.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置（PostgreSQL）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quantviz
DB_USER=postgres
DB_PASSWORD=your_password

# 定时任务
ENABLE_SCHEDULER=false

# 使用模拟数据（开发测试）
USE_MOCK_DATA=true
```

**注意**: 当前版本使用模拟数据，无需配置数据库即可测试。

---

## 📡 API 接口文档

### 基础地址
```
http://localhost:3001/api
```

### 指数接口

#### 获取指数列表
```bash
GET /api/indices?market=CN
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "symbol": "sh000001",
      "name": "上证指数",
      "current_price": 3970.5,
      "change_percent": -0.39
    }
  ],
  "count": 3
}
```

#### 获取指数详情
```bash
GET /api/indices/sh000001
```

#### 获取K线数据
```bash
GET /api/indices/sh000001/kline?period=1d&limit=30
```

### 资讯接口

#### 获取资讯列表
```bash
GET /api/news?limit=50&offset=0
```

#### 获取资讯详情
```bash
GET /api/news/1
```

### 板块接口

#### 获取板块资金流向
```bash
GET /api/sectors/flow?sortBy=main_inflow&limit=50
```

#### 获取板块详情
```bash
GET /api/sectors/BK0001
```

#### 获取板块成分股
```bash
GET /api/sectors/BK0001/stocks?limit=100
```

---

## 🧪 测试指南

### 运行数据采集测试
```bash
cd scripts
npm test
```

**预期结果**:
- ✅ 指数行情: 3 个
- ✅ K线数据: 30 条
- ✅ 资讯数据: 10 条
- ⚠️  板块资金流向: 连接超时（需代理）
- ⚠️  个股资金流向: 连接超时（需代理）

### API 接口测试
```bash
# 测试所有接口
curl http://localhost:3001/api/health
curl http://localhost:3001/api/indices
curl http://localhost:3001/api/indices/sh000001
curl http://localhost:3001/api/indices/sh000001/kline?period=1d&limit=5
curl http://localhost:3001/api/news
curl http://localhost:3001/api/news/1
curl http://localhost:3001/api/sectors/flow
```

---

## 🗄️ 数据库部署（生产环境）

### 1. 创建数据库

**Render 步骤**:
1. 访问 https://render.com
2. 创建新的 PostgreSQL 数据库
3. 选择免费方案
4. 获取连接字符串

### 2. 运行迁移脚本
```bash
# 使用 psql 命令
psql $DATABASE_URL -f migrations/v2-upgrade.sql

# 或手动连接后执行
psql -h <host> -U <user> -d <database> -f migrations/v2-upgrade.sql
```

### 3. 更新环境变量
```env
DB_HOST=<render_host>
DB_PORT=5432
DB_NAME=<database_name>
DB_USER=<username>
DB_PASSWORD=<password>
USE_MOCK_DATA=false
```

---

## 🚨 常见问题

### Q1: 服务器无法启动？
**解决方案**:
```bash
# 检查端口占用
lsof -i :3001

# 杀掉占用进程
kill -9 <PID>
```

### Q2: 数据库连接失败？
**解决方案**:
- 当前版本使用模拟数据，数据库连接失败不影响测试
- 如需连接实际数据库，检查 `.env` 配置

### Q3: 东方财富 API 超时？
**解决方案**:
- 配置 HTTP 代理
- 调整请求超时时间
- 使用备用数据源

---

## 📝 开发指南

### 添加新接口

1. **创建路由** (`routes/xxx.js`)
```javascript
router.get('/', asyncHandler(controller.getList));
```

2. **创建控制器** (`controllers/xxxController.js`)
```javascript
async function getList(req, res) {
  const data = await model.getAll();
  res.json({ success: true, data });
}
```

3. **创建模型** (`models/xxxModel.js`)
```javascript
async function getAll() {
  const result = await db.query('SELECT * FROM table');
  return result.rows;
}
```

4. **挂载路由** (`app.js`)
```javascript
app.use('/api/xxx', xxxRouter);
```

---

## 🔗 相关资源

- **GitHub 仓库**: https://github.com/zhaohongle/quantviz-fullstack
- **技术方案文档**: `docs/DAY1-TECHNICAL-REPORT.md`
- **API 测试报告**: `docs/DAY1-API-TEST-REPORT.md`
- **数据库迁移脚本**: `migrations/v2-upgrade.sql`

---

## 📞 联系方式

**项目负责人**: alex-pm  
**开发者**: fullstack-builder  
**问题反馈**: 通过 GitHub Issues 提交

---

**最后更新**: 2026-04-13 09:55  
**版本**: V2.0.0
