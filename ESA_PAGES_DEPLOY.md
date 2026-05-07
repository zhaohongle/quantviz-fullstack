# QuantViz 阿里云 ESA Pages 部署指南（方案 A）

## 目标架构

- 前端：阿里云 ESA Pages 免费版
- 后端：继续使用 Render
- 后端 API：`https://quantviz-fullstack.onrender.com/api`

这是最快迁移路线，类似 Vercel 托管静态前端，不需要购买 ECS。

## 已做适配

前端入口 `frontend/index.html` 已在 `api-loader.js` 之前加载：

```html
<script src="js/config.js"></script>
```

`frontend/js/config.js` 指定生产 API：

```js
window.QUANTVIZ_API_BASE = 'https://quantviz-fullstack.onrender.com/api';
```

因此部署到 ESA Pages 后，页面仍然从 Render 后端读取实时数据。

## 部署步骤

1. 打开阿里云 ESA 控制台，进入「函数和 Pages」。
2. 新建 Pages 项目。
3. 选择 GitHub 仓库：`zhaohongle/quantviz-fullstack`。
4. 分支选择：`main`。
5. 项目类型选择：静态站点。
6. 构建命令留空。
7. 输出目录填写：

```text
frontend
```

8. 保存并部署。

部署完成后，访问 ESA Pages 给出的域名。

## 验证

打开网站后，右上角状态应显示实时数据连接成功。

也可以在浏览器控制台看到：

```text
API数据加载成功
```

后端健康检查地址：

```text
https://quantviz-fullstack.onrender.com/api/health
```

## 后续迁移

方案 A 只迁移前端。等前端在 ESA Pages 稳定后，再考虑把后端从 Render 迁到：

- 阿里云 SAE
- 阿里云函数计算 FC
- ESA Edge Functions

到那时只需要更新 `frontend/js/config.js` 的 API 地址。
