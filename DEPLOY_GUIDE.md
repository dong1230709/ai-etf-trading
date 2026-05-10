# 🚀 GitHub + Vercel 部署指南

## 第一步：创建GitHub仓库

### 1.1 打开GitHub并登录
访问 https://github.com 并登录你的账户

### 1.2 创建新仓库
1. 点击右上角的 **"+"** 按钮
2. 选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `ai-etf-trading-os` (或你喜欢的名字)
   - **Description**: `AI驱动的ETF与指数交易操作系统`
   - **选择 Public** (公共仓库)
   - **不要**勾选 "Add a README file" (我们已有代码)
4. 点击 **"Create repository"**

### 1.3 复制仓库地址
创建成功后，你会看到仓库页面，复制仓库的HTTPS地址，类似：
```
https://github.com/你的用户名/ai-etf-trading-os.git
```

---

## 第二步：初始化本地Git仓库

在终端中运行以下命令：

```bash
# 1. 进入项目目录
cd /workspace

# 2. 初始化Git仓库
git init

# 3. 添加所有文件到暂存区
git add .

# 4. 创建首次提交
git commit -m "feat: Initial commit - AI ETF Trading OS v1.0"

# 5. 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/ai-etf-trading-os.git

# 6. 推送到GitHub
git branch -M main
git push -u origin main
```

---

## 第三步：连接Vercel实现自动部署

### 3.1 登录Vercel
1. 访问 https://vercel.com
2. 点击 **"Sign Up"**
3. 选择 **"Continue with GitHub"**
4. 授权Vercel访问你的GitHub账户

### 3.2 导入项目
1. 点击 **"Add New..."** → **"Project"**
2. 在 "Import Git Repository" 页面找到你的仓库
3. 点击 **"Import"**

### 3.3 配置项目
Vercel会自动检测到这是React+Vite项目，配置如下：

- **Framework Preset**: Vite (自动)
- **Root Directory**: `.` (保持默认)
- **Build Command**: `npm run build` (自动)
- **Output Directory**: `dist` (自动)

### 3.4 环境变量
点击 **"Environment Variables"**，添加：
- **Name**: `NODE_VERSION`
- **Value**: `18`

### 3.5 部署
点击 **"Deploy"** 按钮，等待2-3分钟部署完成！

---

## 第四步：获取你的外网地址

部署成功后，Vercel会提供：
- **Production URL**: `https://你的项目名.vercel.app`
- 自动分配的免费域名

---

## 🎉 完成！

现在你可以：
- ✅ 分享 `https://你的项目名.vercel.app` 给任何人
- ✅ 任何人可以通过手机浏览器访问
- ✅ 以后代码更新只需要 `git push`，Vercel自动部署

---

## 日常开发流程

```bash
# 1. 修改代码后，提交到Git
git add .
git commit -m "feat: 添加新功能"
git push

# 2. Vercel自动检测到代码更新
# 3. 自动构建并部署
# 4. 访问新地址查看更新
```

---

## 🔧 如果遇到问题

### 问题1：GitHub登录验证
在终端运行：
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### 问题2：推送被拒绝
```bash
git pull origin main --rebase
git push origin main
```

### 问题3：Vercel构建失败
检查 vercel.json 配置是否正确，或查看Vercel控制台的错误日志

---

**准备好了吗？开始第一步：创建GitHub仓库！** 🚀
