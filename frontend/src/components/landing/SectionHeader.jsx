/** Shared landing-page section heading: small label, stamped title block, one-line summary. */
export default function SectionHeader({ eyebrow, title, subtitle, inverted = false, tilt = '-rotate-1' }) {
  return (
    <div className="text-center mb-10 md:mb-14">
      <p className="label-mono text-primary m-0 mb-4">{eyebrow}</p>
      <div
        className={`inline-block px-6 md:px-8 py-3 border-4 border-black ${tilt} ${inverted ? 'bg-black' : 'bg-white'}`}
        style={{ boxShadow: inverted ? '6px 6px 0px 0px #059669' : '6px 6px 0px 0px #000' }}
      >
        <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter m-0 ${inverted ? 'text-white' : 'text-black'}`}>
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-5 text-base md:text-lg text-muted max-w-xl mx-auto font-semibold">
          {subtitle}
        </p>
      )}
    </div>
  );
}
