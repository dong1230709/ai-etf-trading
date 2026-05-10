# AI ETF & Index Trading OS - 技术架构文档

## 1. 架构设计

### 系统分层架构
```
┌─────────────────────────────────────┐
│     UI Layer (React Components)     │
│  Pages, Layouts, Reusable Components│
├─────────────────────────────────────┤
│    State Layer (Zustand Stores)      │
│  App State, User Preferences, Data   │
├─────────────────────────────────────┤
│    Router Layer (React Router)       │
│    Route Definitions & Guards        │
├─────────────────────────────────────┤
│    Animation Layer (Framer Motion)   │
│    Page Transitions, Micro-interactions│
└─────────────────────────────────────┘
```

## 2. 技术栈详解

### 2.1 核心依赖
- **React 18**: UI渲染核心
- **TypeScript 5**: 类型安全
- **Vite 5**: 快速构建工具
- **TailwindCSS 3**: 原子化CSS框架
- **Zustand 4**: 轻量状态管理
- **Framer Motion 11**: 专业动画库
- **React Router DOM 6**: 客户端路由

### 2.2 辅助工具
- **Lucide React**: 图标库
- **clsx**: 条件类名工具
- **tailwind-merge**: Tailwind类名合并

## 3. 路由定义

### 路由表
```typescript
interface RouteConfig {
  path: string;
  name: string;
  component: React.ComponentType;
  icon: LucideIcon;
}

const routes: RouteConfig[] = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/grid', name: 'Grid Trading', component: GridTrading },
  { path: '/ai-plan', name: 'AI Plan', component: AIPlan },
  { path: '/risk', name: 'Risk Center', component: RiskCenter },
  { path: '/settings', name: 'Settings', component: Settings },
];
```

## 4. 状态管理设计

### 4.1 Store结构
```typescript
// appStore - 全局应用状态
interface AppStore {
  theme: 'dark' | 'light';
  isMobile: boolean;
  activeTab: string;
}

// mockStore - 模拟数据状态（后续替换为API）
interface MockStore {
  portfolio: Portfolio;
  positions: Position[];
  marketData: MarketIndex[];
}
```

### 4.2 持久化策略
- 用户偏好（主题、语言）使用 localStorage
- 交易数据不持久化（仅内存）

## 5. 组件架构

### 5.1 组件层级
```
App
├── AppLayout
│   ├── Header
│   ├── PageContent (AnimatePresence)
│   └── BottomNav
├── Pages
│   ├── Dashboard
│   │   ├── PortfolioSummary
│   │   ├── MarketIndices
│   │   ├── QuickActions
│   │   └── RecentActivity
│   ├── GridTrading
│   ├── AIPlan
│   ├── RiskCenter
│   └── Settings
└── Shared Components
    ├── Card
    ├── Button
    ├── Badge
    └── StatCard
```

### 5.2 组件规范
- 每个组件文件不超过200行
- 使用TypeScript严格模式
- Props使用interface定义
- 支持ref转发（需要时）

## 6. 样式系统

### 6.1 Tailwind配置
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0a0e17',
          card: '#1a2332',
          border: '#2e3a52',
          green: '#00d68f',
          red: '#ff3d71',
          blue: '#3366ff',
          gold: '#ffc107',
        }
      }
    }
  }
}
```

### 6.2 CSS变量
```css
:root {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-card: #1a2332;
  --text-primary: #ffffff;
  --text-secondary: #8f9bb3;
  --border-color: #2e3a52;
}
```

## 7. 动画策略

### 7.1 页面过渡
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// 持续时间: 300ms
// 缓动函数: easeOut
```

### 7.2 卡片动画
- 进入: staggered fade-in + slide-up
- 间隔: 100ms per card
- 悬停: subtle scale + glow

### 7.3 数据动画
- 数字变化: 计数动画
- 涨跌变化: 颜色闪烁

## 8. 响应式断点

```javascript
const breakpoints = {
  mobile: '375px',   // 默认
  tablet: '768px',   // sm:
  desktop: '1024px', // md:
  wide: '1280px'     // lg:
};
```

## 9. 文件组织

```
src/
├── main.tsx                 # 应用入口
├── App.tsx                   # 根组件
├── index.css                # 全局样式
├── components/              # 组件目录
│   ├── ui/                 # 基础UI
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── layout/            # 布局组件
│   │   ├── AppLayout.tsx
│   │   └── BottomNav.tsx
│   └── dashboard/          # Dashboard组件
│       ├── PortfolioSummary.tsx
│       ├── MarketIndex.tsx
│       └── QuickActions.tsx
├── pages/                  # 页面组件
│   ├── Dashboard.tsx
│   ├── GridTrading.tsx
│   ├── AIPlan.tsx
│   ├── RiskCenter.tsx
│   └── Settings.tsx
├── stores/                 # Zustand stores
│   └── useAppStore.ts
├── hooks/                  # 自定义Hooks
│   └── useMediaQuery.ts
├── types/                  # 类型定义
│   └── index.ts
└── utils/                  # 工具函数
    └── format.ts
```

## 10. 开发规范

### 10.1 命名规范
- 组件: PascalCase (Dashboard.tsx)
- 工具函数: camelCase (formatCurrency.ts)
- CSS类: kebab-case (text-primary)
- 常量: UPPER_SNAKE_CASE

### 10.2 代码风格
- 使用ESLint + Prettier
- 单引号字符串
- 无分号
- 箭头函数优先
- 解构赋值优先

### 10.3 Git提交规范
```
feat: 新功能
fix: 修复bug
refactor: 重构
style: 样式调整
docs: 文档更新
```

## 11. 性能优化

### 11.1 路由懒加载
- 所有页面组件使用React.lazy
- 配合Suspense展示加载状态

### 11.2 组件优化
- 使用React.memo减少不必要渲染
- useMemo缓存计算结果
- useCallback缓存回调函数

### 11.3 动画性能
- 使用transform和opacity
- 避免触发布局的重排
- 使用will-change提示
