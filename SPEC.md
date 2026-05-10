# AI ETF & Index Trading OS - 技术规范文档

## 1. 项目概述与目标

AI驱动ETF与指数交易操作系统的第一阶段基础框架，采用Bloomberg/TradingView专业金融终端UI风格。

### 核心目标
- 构建移动优先的专业金融终端UI框架
- 实现5个核心页面的基础UI结构
- 提供流畅的动画和优秀的用户体验
- 为后续AI功能、行情接口和网格逻辑开发奠定基础

### 技术栈
- React 18 + TypeScript
- Vite 6 (构建工具)
- TailwindCSS 3 (样式方案)
- Zustand 4 (状态管理)
- Framer Motion 11 (动画库)
- React Router DOM 6 (路由)

## 2. UI/UX规范

### 2.1 视觉设计

#### 色彩系统
```
主背景色: #0a0e17 (深蓝黑)
次级背景: #111827
卡片背景: #1a2332
卡片悬停: #1f2a40
边框色: #2e3a52

强调色 - 涨/盈利: #00d68f (翠绿)
强调色 - 跌/亏损: #ff3d71 (玫红)
强调色 - 主色: #3366ff (蓝)
强调色 - 警示: #ffc107 (金)

文字 - 主要: #ffffff
文字 - 次级: #8f9bb3
文字 - 辅助: #5a6178
```

#### 字体系统
- 主字体: Inter (数字、数据展示)
- 中文字体: Noto Sans SC (中文内容)
- 等宽字体: JetBrains Mono (代码、数值)

#### 间距系统
- 基础单位: 4px
- 卡片内边距: 16px
- 卡片间距: 12px
- 页面边距: 16px (移动端)

#### 动画规范
- 页面切换: 淡入淡出 300ms
- 卡片出现: 滑入 + 淡入, staggered 100ms
- 按钮交互: scale 0.98 + 背景色变化
- 过渡曲线: ease-out

### 2.2 页面结构

#### Dashboard (首页)
- 今日收益概览卡片
- 总资产和累计收益统计
- 市场指数横向滚动卡片
- 快捷入口(网格交易、AI计划、风险中心、提醒)
- 我的持仓列表

#### Grid Trading (网格交易)
- 总投入和累计收益统计
- 活跃策略列表
- 策略状态显示(运行中/已暂停)
- 策略参数配置入口
- 网格原理说明

#### AI Plan (AI计划)
- AI分析统计卡片(平均置信度、最高置信度、待执行数)
- 交易信号列表
- 置信度进度条
- 信号详情(目标价、止损价、有效期)
- AI策略特点说明

#### Risk Center (风险中心)
- 综合风险评分仪表盘
- 风险指标详情列表
- 风险控制建议
- 风险模拟测试入口

#### Settings (设置)
- 用户信息卡片
- 偏好设置(深色模式、通知、语言)
- 交易设置(支付方式、交易限额、持仓显示)
- 安全设置(登录密码、两步验证)
- 其他(帮助、关于、退出登录)

### 2.3 组件系统

#### Card 组件
- 默认状态: bg-finance-card, border-finance-border, rounded-2xl
- 悬停状态: bg-finance-card-hover, border变亮
- 点击效果: scale(0.99)
- 可交互卡片: cursor-pointer + hover效果

#### Badge 组件
- 绿色: bg-finance-green-muted, text-finance-green
- 红色: bg-finance-red-muted, text-finance-red
- 蓝色: bg-finance-blue-muted, text-finance-blue
- 金色: bg-finance-gold-muted, text-finance-gold

#### BottomNav 组件
- 固定底部导航
- 5个导航项: 首页、网格、AI计划、风险、设置
- 当前页面高亮(图标放大 + 文字加粗 + 底部指示条)
- 玻璃态背景效果

## 3. 功能规范

### 3.1 路由系统
```
/           → Dashboard (首页)
/grid       → Grid Trading (网格交易)
/ai-plan    → AI Plan (AI计划)
/risk       → Risk Center (风险中心)
/settings   → Settings (设置)
```

### 3.2 状态管理
使用Zustand管理以下状态:
- portfolio: 投资组合数据
- positions: 持仓列表
- marketIndices: 市场指数
- gridStrategies: 网格策略
- aiPlans: AI计划
- riskMetrics: 风险指标
- theme: 主题设置
- activeTab: 当前激活的Tab

### 3.3 动画系统
- 页面切换: AnimatePresence + motion.div
- 卡片列表: staggered children动画
- 进度条: motion.div width动画
- 导航: layoutId实现平滑过渡

## 4. 技术架构

### 4.1 项目结构
```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── layout/         # 布局组件
│   │   └── BottomNav.tsx
│   └── ai/            # AI相关组件
│       └── AISignals.tsx
├── pages/             # 页面组件
│   ├── Dashboard.tsx
│   ├── GridTrading.tsx
│   ├── AIPlan.tsx
│   ├── RiskCenter.tsx
│   └── Settings.tsx
├── stores/           # Zustand stores
│   └── useAppStore.ts
├── hooks/            # 自定义Hooks
│   ├── useMarketData.ts
│   └── useAISignals.ts
├── types/            # TypeScript类型定义
│   └── index.ts
├── utils/            # 工具函数
│   └── format.ts
├── App.tsx           # 根组件
├── main.tsx          # 应用入口
└── index.css         # 全局样式
```

### 4.2 响应式策略
- 移动优先设计 (默认375px)
- 最大宽度限制 (max-w-lg: 32rem)
- 底部固定导航
- 横向滚动容器
- 安全区域适配 (env(safe-area-inset-bottom))

## 5. 第一阶段待办

### 已完成 ✅
- [x] 项目结构搭建
- [x] 路由系统配置
- [x] 深色主题系统
- [x] Dashboard主页UI
- [x] 底部Tab导航
- [x] 卡片组件系统
- [x] 响应式移动端适配
- [x] 所有页面UI框架
- [x] TypeScript类型检查
- [x] 动画效果集成

### 暂不实现 ❌
- [ ] AI交易逻辑实现
- [ ] 实时行情接口对接
- [ ] 网格交易算法
- [ ] 后端API开发
- [ ] 用户认证系统
- [ ] 数据持久化

## 6. 开发规范

### 代码风格
- 组件使用PascalCase命名
- 工具函数使用camelCase命名
- CSS类名使用kebab-case
- 使用TypeScript strict模式
- 组件文件不超过200行
- Props使用interface定义

### Git提交规范
```
feat: 新功能
fix: 修复bug
refactor: 重构
style: 样式调整
docs: 文档更新
```

## 7. 性能优化

### 已实施
- React.memo减少不必要渲染
- useMemo缓存计算结果
- useCallback缓存回调函数
- motion.div使用transform和opacity
- 图片懒加载(后续)

### 待实施
- 路由懒加载
- 虚拟列表(长列表)
- 代码分割
