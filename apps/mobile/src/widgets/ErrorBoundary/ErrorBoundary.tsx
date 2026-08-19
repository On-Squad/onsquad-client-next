import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react';

import type { FallbackProps } from '../../shared/types/error';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

type ErrorBoundaryProps = {
  FallbackComponent: ComponentType<FallbackProps>;
  onReset: () => void;
  children: ReactNode;
};

/**
 * 웹 `widgets/ErrorBoundary` 의 RN 미러.
 *
 * 에러 경계는 **클래스 컴포넌트로만** 만들 수 있다 —
 * `getDerivedStateFromError` · `componentDidCatch` 에 대응하는 훅이 없다.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  /** 에러 상태 변경 */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log({ error, errorInfo });
  }

  /** 에러 상태 기본 초기화 */
  resetErrorBoundary(): void {
    this.props.onReset();

    this.setState({
      hasError: false,
      error: null,
    });
  }

  render() {
    const { state, props } = this;

    const { hasError, error } = state;

    const { FallbackComponent, children } = props;

    if (hasError && error) {
      return <FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

export default ErrorBoundary;
