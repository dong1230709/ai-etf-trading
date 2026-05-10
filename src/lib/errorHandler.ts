export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, context);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class DataError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATA_ERROR', 500, context);
    this.name = 'DataError';
  }
}

interface ErrorLog {
  timestamp: number;
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorHandler {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;
  private listeners: ((error: ErrorLog) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private handleWindowError(event: ErrorEvent) {
    this.log({
      message: event.message,
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason;
    this.log({
      message: error?.message || 'Unhandled Promise Rejection',
      stack: error?.stack,
      context: { reason: String(error) }
    });
  }

  log(error: Omit<ErrorLog, 'timestamp' | 'userAgent' | 'url'>) {
    const log: ErrorLog = {
      timestamp: Date.now(),
      message: error.message,
      code: error.code,
      stack: error.stack,
      context: error.context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.notifyListeners(log);
    this.reportToServer(log);
  }

  subscribe(listener: (error: ErrorLog) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(error: ErrorLog) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  private async reportToServer(error: ErrorLog) {
    if (error.code === 'NETWORK_ERROR') {
      console.warn('Network error logged:', error.message);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  formatError(error: unknown): string {
    if (error instanceof AppError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

export const errorHandler = new ErrorHandler();

export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.log({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { function: context || fn.name }
      });
      throw error;
    }
  }) as T;
}

export async function withAsyncErrorHandling<T>(
  promise: Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    errorHandler.log({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: { function: context }
    });
    throw error;
  }
}
