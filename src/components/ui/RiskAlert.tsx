import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertType = 'info' | 'warning' | 'danger' | 'success';

interface RiskAlertProps {
  type: AlertType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
  onClose?: () => void;
}

const alertConfig = {
  info: {
    icon: Info,
    bgClass: 'bg-finance-blue/10 border-finance-blue/30',
    iconClass: 'text-finance-blue',
    titleClass: 'text-finance-blue',
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-finance-gold/10 border-finance-gold/30',
    iconClass: 'text-finance-gold',
    titleClass: 'text-finance-gold',
  },
  danger: {
    icon: AlertTriangle,
    bgClass: 'bg-finance-red/10 border-finance-red/30',
    iconClass: 'text-finance-red',
    titleClass: 'text-finance-red',
  },
  success: {
    icon: AlertCircle,
    bgClass: 'bg-finance-green/10 border-finance-green/30',
    iconClass: 'text-finance-green',
    titleClass: 'text-finance-green',
  },
};

export function RiskAlert({
  type,
  title,
  message,
  action,
  autoClose,
  onClose,
}: RiskAlertProps) {
  const [visible, setVisible] = useState(true);
  const config = alertConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`${config.bgClass} border rounded-xl p-4 animate-in slide-in-from-top-2`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${config.titleClass}`}>{title}</h4>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-finance-blue hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AlertContainerProps {
  alerts: Array<{
    id: string;
    type: AlertType;
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    autoClose?: number;
  }>;
  onDismiss: (id: string) => void;
}

export function AlertContainer({ alerts, onDismiss }: AlertContainerProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-lg mx-auto">
      {alerts.map((alert) => (
        <RiskAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          action={alert.action}
          autoClose={alert.autoClose}
          onClose={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
}
