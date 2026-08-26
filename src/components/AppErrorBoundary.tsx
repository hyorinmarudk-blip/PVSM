import React from "react";

import {
  logFrontendError,
  normalizeError,
} from "../services/errorService";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(
    error: Error,
  ): AppErrorBoundaryState {
    return {
      hasError: true,
      message:
        error.message ||
        "An unexpected application error occurred.",
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo,
  ) {
    logFrontendError(
      normalizeError(
        error,
        errorInfo.componentStack ??
          undefined,
      ),
    );
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal-error-screen">
          <div className="fatal-error-card">
            <div className="fatal-error-code">
              PVSM
            </div>

            <h1>
              Something went wrong
            </h1>

            <p>
              PVSM encountered an unexpected
              interface error.
            </p>

            <p className="fatal-error-detail">
              {this.state.message}
            </p>

            <button
              className="primary-button"
              onClick={this.reload}
            >
              Reload PVSM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;