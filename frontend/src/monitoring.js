/**
 * Error tracking. Sentry is loaded only when VITE_SENTRY_DSN is set, so without
 * it there is no extra download and errors just go to the console.
 */
let sentry = null;

export async function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  try {
    sentry = await import('@sentry/react');
    sentry.init({
      dsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  } catch (err) {
    console.warn('Error tracking failed to start:', err);
  }
}

export function reportError(error, context) {
  if (sentry) {
    sentry.captureException(error, context ? { extra: context } : undefined);
  } else {
    console.error(error, context);
  }
}
