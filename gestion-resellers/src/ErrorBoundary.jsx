import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-base">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-amber-dark mb-3">
              <AlertTriangle size={20} />
              <h1 className="font-semibold text-ink">Ocurrió un error</h1>
            </div>
            <p className="text-sm text-muted mb-4">
              La aplicación encontró un problema, pero no se cerró. Podés
              reintentar o recargar la página.
            </p>
            <pre className="text-xs bg-base border border-line p-2 overflow-auto mb-4">
              {String(this.state.error?.message || this.state.error || "")}
            </pre>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={this.handleReset}>
                Reintentar
              </button>
              <button
                className="btn-ghost"
                onClick={() => window.location.reload()}
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
