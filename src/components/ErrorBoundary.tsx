import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDetailsOpen: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsOpen: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(
      "Elevated Application Error caught by ErrorBoundary:",
      error,
      errorInfo
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `Error: ${error?.message || "Unknown error"}\n\nStack:\n${error?.stack || "N/A"}\n\nComponent Stack:\n${errorInfo?.componentStack || "N/A"}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, isDetailsOpen, copied } = this.state;

      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-2xl bg-stone-950 border border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header with warning icon */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  Application Runtime Error
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  Something went wrong while rendering this page
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  An error was caught and elevated to prevent silent crashes.
                  Details are displayed below.
                </p>
              </div>
            </div>

            {/* Error Message Callout */}
            <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 text-xs font-mono text-red-200 break-words leading-relaxed">
              <strong>Error: </strong>
              {error?.message || "An unexpected runtime error occurred."}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleCopy}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">
                      Copied to Clipboard
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Error Details</span>
                  </>
                )}
              </button>

              <button
                onClick={() => this.setState({ isDetailsOpen: !isDetailsOpen })}
                className="px-3 py-2.5 text-stone-400 hover:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition ml-auto cursor-pointer"
              >
                <span>
                  {isDetailsOpen
                    ? "Hide Technical Details"
                    : "View Stack Trace"}
                </span>
                {isDetailsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Collapsible Stack Trace */}
            {isDetailsOpen && (
              <div className="pt-2 border-t border-stone-850 space-y-3 animate-fade-in">
                {error?.stack && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                      Error Stack
                    </span>
                    <pre className="bg-stone-900 p-3 rounded-lg text-[11px] font-mono text-stone-300 overflow-x-auto max-h-48 border border-stone-800">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                      Component Hierarchy Stack
                    </span>
                    <pre className="bg-stone-900 p-3 rounded-lg text-[11px] font-mono text-stone-400 overflow-x-auto max-h-48 border border-stone-800">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
