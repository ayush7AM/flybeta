import { Component } from 'react';
import { reportError } from '../monitoring';

/**
 * Catches render errors so a crash shows a way out instead of a blank page.
 * Changing `resetKey` (the route) clears the error, so navigating away recovers.
 */
export default class ErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  componentDidCatch(error, info) {
    reportError(error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;

    // After a deploy, old page chunks disappear — a reload fetches the new ones
    const isStaleChunk = /dynamically imported module|Loading chunk|Importing a module script/i
      .test(this.state.error?.message || '');

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-canvas text-ink">
        <div className="brutalist-card p-6 md:p-10 max-w-md text-center">
          <p className="text-5xl m-0 mb-4">🛠️</p>
          <h1 className="heading-lg m-0 mb-3">
            {isStaleChunk ? 'FlyBeta was updated' : 'Something went wrong'}
          </h1>
          <p className="text-muted mb-6">
            {isStaleChunk
              ? 'A newer version is available. Reload to continue.'
              : "This page hit an unexpected error. It's been logged — try reloading, or head back to your tracks."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => window.location.reload()} className="brutalist-btn brutalist-btn-primary">
              Reload
            </button>
            <a href="/tracks" className="brutalist-btn bg-surface text-ink no-underline">
              Go to Tracks
            </a>
          </div>
        </div>
      </div>
    );
  }
}
