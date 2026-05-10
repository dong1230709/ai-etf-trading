import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun,
  Bell,
  Lock,
  Globe,
  ChevronRight,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  Smartphone,
  Eye,
  Shield
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface SettingsRowProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'green' | 'red' | 'blue' | 'gold' | 'default';
  onClick?: () => void;
}

function SettingsRow({ icon: Icon, title, subtitle, badge, badgeVariant = 'default', onClick }: SettingsRowProps) {
  return (
    <motion.button
      className="w-full flex items-center gap-4 p-4 hover:bg-finance-card-hover rounded-xl transition-colors"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-2 bg-finance-blue/20 rounded-xl">
        <Icon className="w-5 h-5 text-finance-blue" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </motion.button>
  );
}

export const Settings = () => {
  const { theme, setTheme } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(3);

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-finance-blue/20 rounded-xl">
            <SettingsIcon className="w-6 h-6 text-finance-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">设置</h1>
            <p className="text-sm text-gray-400">个性化配置与账户管理</p>
          </div>
        </div>
      </motion.header>

      <motion.div variants={item}>
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-finance-blue to-finance-green rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">投资达人</h3>
              <p className="text-sm text-gray-400">ID: 88888888</p>
              <Badge variant="green" className="mt-1">
                <Shield className="w-3 h-3 mr-1" />
                已认证
              </Badge>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">偏好设置</h2>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <Card className="p-2">
          <SettingsRow
            icon={theme === 'dark' ? Moon : Sun}
            title="深色模式"
            subtitle={theme === 'dark' ? '已开启' : '已关闭'}
            badge={theme === 'dark' ? 'ON' : 'OFF'}
            badgeVariant="blue"
            onClick={handleToggleTheme}
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={Bell}
            title="消息通知"
            subtitle="接收交易提醒与AI信号"
            badge={notifications ? `${notificationsCount}个` : '已关闭'}
            badgeVariant={notifications ? "gold" : "default"}
            onClick={handleToggleNotifications}
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={Globe}
            title="语言"
            subtitle="简体中文"
          />
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">交易设置</h2>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <Card className="p-2">
          <SettingsRow
            icon={CreditCard}
            title="支付方式"
            subtitle="绑定银行卡"
            badge="已绑定"
            badgeVariant="green"
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={Smartphone}
            title="交易限额"
            subtitle="单笔最大 ¥50,000"
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={Eye}
            title="持仓显示"
            subtitle="成本价与盈亏展示"
          />
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">安全设置</h2>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <Card className="p-2">
          <SettingsRow
            icon={Lock}
            title="登录密码"
            subtitle="已设置"
            badge="已加密"
            badgeVariant="green"
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={Shield}
            title="两步验证"
            subtitle="短信验证"
          />
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">其他</h2>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <Card className="p-2">
          <SettingsRow
            icon={HelpCircle}
            title="帮助与反馈"
            subtitle="常见问题与联系客服"
          />
          <div className="h-px bg-finance-border mx-2" />
          <SettingsRow
            icon={SettingsIcon}
            title="关于应用"
            subtitle="版本 1.0.0"
          />
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <button className="w-full py-4 bg-finance-red/10 border border-finance-red/30 rounded-xl text-finance-red font-medium flex items-center justify-center gap-2 hover:bg-finance-red/20 transition-colors">
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </motion.div>
    </motion.div>
  );
};
