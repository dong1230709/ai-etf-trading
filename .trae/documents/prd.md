# AI ETF & Index Trading OS - 产品需求文档

## 1. 产品概述

专业的AI驱动ETF与指数交易操作系统，采用Bloomberg/TradingView风格的专业金融终端UI设计。第一阶段聚焦于基础框架搭建，为后续AI交易功能、行情接口和网格逻辑奠定坚实基础。

### 核心定位
- 面向专业投资者的移动端交易终端
- 提供直观的Dashboard概览
- 支持网格交易策略配置
- 智能AI交易计划管理
- 全方位风险管理中心

## 2. 核心功能模块

### 2.1 页面结构

| 页面名称 | 路由 | 核心功能 |
|---------|------|---------|
| Dashboard | `/` | 投资组合概览、市场指数、收益统计、快捷入口 |
| Grid Trading | `/grid` | 网格策略配置、持仓管理、交易历史 |
| AI Plan | `/ai-plan` | AI策略推荐、信号展示、策略回测 |
| Risk Center | `/risk` | 风险指标、杠杆管理、止损设置 |
| Settings | `/settings` | 账户设置、主题切换、通知管理 |

### 2.2 导航结构
- 底部Tab导航栏（移动端主导航）
- 5个核心功能入口
- 当前页面高亮指示

## 3. 技术架构

### 3.1 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **路由**: React Router DOM v6

### 3.2 项目结构
```
src/
├── components/       # 可复用组件
│   ├── ui/          # 基础UI组件
│   ├── layout/      # 布局组件
│   └── charts/      # 图表组件（预留）
├── pages/           # 页面组件
├── hooks/          # 自定义Hooks
├── stores/         # Zustand状态存储
├── styles/         # 全局样式
├── types/          # TypeScript类型定义
└── utils/          # 工具函数
```

## 4. UI设计规范

### 4.1 设计风格
- **主题**: 深色主题（Dark Mode Primary）
- **风格参考**: Bloomberg Terminal + TradingView
- **美学特征**:
  - 数据密集型信息展示
  - 高对比度文字
  - 专业金融配色
  - 卡片化布局
  - 微妙的玻璃态效果

### 4.2 色彩系统
```css
--bg-primary: #0a0e17        /* 主背景 - 深蓝黑 */
--bg-secondary: #111827     /* 次级背景 */
--bg-card: #1a2332           /* 卡片背景 */
--accent-green: #00d68f     /* 涨/盈利 - 翠绿 */
--accent-red: #ff3d71       /* 跌/亏损 - 玫红 */
--accent-blue: #3366ff      /* 主强调色 */
--accent-gold: #ffc107      /* 警示/高亮 */
--text-primary: #ffffff      /* 主要文字 */
--text-secondary: #8f9bb3    /* 次级文字 */
--border-subtle: #2e3a52    /* 边框色 */
```

### 4.3 字体规范
- **主字体**: Inter (数字、数据展示)
- **中文字体**: Noto Sans SC (中文内容)
- **等宽字体**: JetBrains Mono (代码、数值)

### 4.4 间距系统
- 基础单位: 4px
- 卡片内边距: 16px
- 卡片间距: 12px
- 页面边距: 16px (移动端)

### 4.5 动画规范
- 页面切换: 淡入淡出 300ms
- 卡片出现: 滑入 + 淡入, staggered 100ms
- 按钮交互: scale 0.98 + 背景色变化
- 数据更新: 数字滚动动画

## 5. 第一阶段目标

### 必须完成
1. ✅ 项目结构搭建
2. ✅ 路由系统配置
3. ✅ 深色主题系统
4. ✅ Dashboard主页UI
5. ✅ 底部Tab导航
6. ✅ 卡片组件系统
7. ✅ 响应式移动端适配

### 暂不实现
- ❌ AI交易逻辑
- ❌ 实时行情接口
- ❌ 网格交易算法
- ❌ 后端API对接
- ❌ 用户认证系统

## 6. 响应式策略

### 移动优先
- 默认设计针对375px宽度优化
- 主要内容区域单列布局
- 底部Tab导航固定
- 卡片全宽展示

### 平板适配
- 卡片采用2列网格
- 侧边间距增加
- 更大的触控区域

### 桌面适配
- 最大宽度1200px
- 3-4列卡片网格
- 可选的侧边导航

## 7. 组件清单

### 布局组件
- `AppLayout` - 应用主布局
- `BottomNav` - 底部导航栏
- `PageContainer` - 页面容器

### UI组件
- `Card` - 通用卡片
- `StatCard` - 数据统计卡片
- `Badge` - 状态徽章
- `Button` - 按钮组件
- `IconButton` - 图标按钮

### 业务组件
- `PortfolioSummary` - 投资组合摘要
- `MarketIndex` - 市场指数展示
- `QuickAction` - 快捷操作入口
- `ProfitChart` - 收益图表（预留）
