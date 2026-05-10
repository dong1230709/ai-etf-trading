# GitHub + Vercel 部署指南

## 步骤1：推送到GitHub

在终端执行以下命令：

```bash
cd /workspace

# 添加远程仓库
git remote add origin https://github.com/dong1230709/ai-etf-trading.git

# 提交所有文件
git commit -m "feat: 完成AI ETF交易系统开发

- Professional Grid Engine 网格交易引擎
- AI Engine 智能分析引擎
- 实时行情系统
- PWA支持
- 移动端优化
- 专业级UI/UX"

# 推送到GitHub
git branch -M main
git push -u origin main
```

## 步骤2：在Vercel部署

1. 打开浏览器访问：https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择仓库 `dong1230709/ai-etf-trading`
5. 点击 "Import"
6. Framework Preset 选择 "Vite"（如果不是自动检测）
7. 点击 "Deploy"
8. 等待部署完成，获得部署URL

## 步骤3：完成！

部署成功后，你将获得一个类似 `https://ai-etf-trading.vercel.app` 的链接

直接用手机访问这个链接即可！

## 功能页面

- 首页：`/`
- 网格交易：`/grid`
- 专业网格：`/grid-engine`
- AI分析：`/ai-plan`
- 风险中心：`/risk`
- 设置：`/settings`

## 更新代码

修改代码后执行：
```bash
cd /workspace
git add .
git commit -m "你的更新说明"
git push
```

Vercel会自动重新部署！
