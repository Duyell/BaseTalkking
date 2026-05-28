import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-error)' }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>页面发生错误</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
            {this.state.error?.message || '未知错误'}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
