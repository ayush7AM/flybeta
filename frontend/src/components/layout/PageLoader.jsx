/** Placeholder while a page's code downloads. */
export default function PageLoader({ fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[60vh]'}`}>
      <p className="label-mono text-muted m-0">Loading…</p>
    </div>
  );
}
