import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-150 p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Something went wrong with the interface
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। নিচে সমাধান ও ত্রুটির বিবরণ দেওয়া হলো।
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Error Details (কোথায় কি সমস্যা হয়েছে)
                </span>
                <p className="text-sm font-mono text-red-600 bg-red-50 p-2 rounded border border-red-100 overflow-x-auto whitespace-pre-wrap">
                  {this.state.error?.toString() || 'Unknown client-side exception'}
                </p>
              </div>

              {this.state.errorInfo && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Component Stack Trace
                  </span>
                  <pre className="text-xs font-mono text-slate-600 overflow-x-auto max-h-40 p-2 bg-white rounded border border-slate-200">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-100 gap-2 text-sm"
              >
                <RefreshCw size={16} />
                Reload Page (পেজ রিফ্রেশ করুন)
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all gap-2 text-sm"
              >
                <Trash2 size={16} className="text-red-500" />
                Clear Local Data & Reset (ডাটা রিসেট করুন)
              </button>
            </div>
            
            <p className="text-xs text-slate-400 text-center pt-2">
              Tip: If you recently changed env keys or entered bad data in local storage, click <strong>Clear Local Data & Reset</strong> to fix it.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
