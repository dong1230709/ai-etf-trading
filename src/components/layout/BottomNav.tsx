import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Grid3X3, Bot, Shield, Settings, Sparkles } from 'lucide-react';
import { cn } from '../ui/Card';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页' },
  { path: '/grid', icon: Grid3X3, label: '网格' },
  { path: '/grid-engine', icon: Sparkles, label: '专业' },
  { path: '/ai-plan', icon: Bot, label: 'AI计划' },
  { path: '/risk', icon: Shield, label: '风险' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-finance-bg/95 backdrop-blur-xl border-t border-finance-border safe-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center py-2 px-4 rounded-xl transition-all',
                isActive ? 'text-finance-blue' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative"
              >
                <Icon className={cn('w-6 h-6', isActive && 'drop-shadow-lg')} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 bg-finance-blue/20 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              
              <span className={cn(
                'text-xs mt-1 transition-all',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-finance-blue rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
