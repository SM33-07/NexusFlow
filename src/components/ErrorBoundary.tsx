'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nexus Critical System Failure:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-xl p-8 shadow-[0_0_40px_rgba(244,63,94,0.2)] text-center">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-100 mb-2 font-mono">SYSTEM FAULT DETECTED</h1>
            <p className="text-slate-400 text-sm mb-6 bg-slate-950 p-3 rounded border border-slate-800 font-mono overflow-x-auto">
              {this.state.errorMsg || "Memory overload in node layout parameters."}
            </p>
            <button
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg font-bold transition-colors border border-slate-700"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} />
              Reboot Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}