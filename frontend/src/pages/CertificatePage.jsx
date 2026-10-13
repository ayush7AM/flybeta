import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCertificate } from '../services/api';
import logoImg from '../assets/logo.webp';

// Fixed palette: a certificate should look (and print) the same under every theme
const INK = '#111111';
const PAPER = '#FFFDF7';
const ACCENT = '#E52E2E';
const GOLD = '#EAB308';

export default function CertificatePage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCertificate(certificateId)
      .then(setCertificate)
      .catch((err) => setError(err.response?.status === 404 ? 'not-found' : 'failed'));
  }, [certificateId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — the URL bar still has it */ }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: PAPER, color: INK }}>
        <div className="max-w-md text-center border-4 p-8" style={{ borderColor: INK, boxShadow: `8px 8px 0 0 ${INK}` }}>
          <h1 className="text-2xl font-black uppercase m-0 mb-3">
            {error === 'not-found' ? 'Certificate not found' : "Couldn't load certificate"}
          </h1>
          <p className="mb-6">
            {error === 'not-found'
              ? "This link doesn't match any FlyBeta certificate. Check that it was copied in full."
              : 'Please try again in a moment.'}
          </p>
          <Link to="/" className="font-bold underline" style={{ color: INK }}>← Back to FlyBeta</Link>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAPER, color: INK }}>
        <p className="font-bold uppercase tracking-widest">Loading certificate…</p>
      </div>
    );
  }

  const completedOn = new Date(certificate.completed_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="certificate-page min-h-screen py-8 px-4" style={{ background: '#EDEBE6', color: INK }}>
      {/* Actions — hidden when printing */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/tracks" className="font-bold uppercase text-sm no-underline" style={{ color: INK }}>← FlyBeta</Link>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyLink}
            className="px-4 py-2 font-bold uppercase text-sm border-2 cursor-pointer"
            style={{ borderColor: INK, background: '#fff', color: INK, boxShadow: `3px 3px 0 0 ${INK}` }}
          >
            {copied ? '✓ Link copied' : '🔗 Copy link'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 font-bold uppercase text-sm border-2 cursor-pointer"
            style={{ borderColor: INK, background: ACCENT, color: '#fff', boxShadow: `3px 3px 0 0 ${INK}` }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* The certificate */}
      <article
        className="certificate max-w-4xl mx-auto relative"
        style={{ background: PAPER, border: `6px solid ${INK}`, boxShadow: `12px 12px 0 0 ${INK}` }}
      >
        <div className="m-3 md:m-4 p-6 md:p-12 text-center" style={{ border: `2px solid ${INK}` }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={logoImg} alt="" className="w-10 h-10 object-contain" style={{ mixBlendMode: 'multiply' }} />
            <span className="font-black text-2xl tracking-tighter uppercase">FlyBeta</span>
          </div>

          <p className="uppercase font-bold m-0 mb-2" style={{ letterSpacing: '0.3em', fontSize: '12px', color: ACCENT }}>
            Certificate of Completion
          </p>
          <p className="m-0 mb-6 text-base">This certifies that</p>

          <h1
            className="m-0 mb-6 break-words"
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(36px, 7vw, 64px)', lineHeight: 1.05, textTransform: 'none' }}
          >
            {certificate.name}
          </h1>

          <p className="m-0 mb-2 text-base md:text-lg">has completed the</p>
          <p
            className="inline-block m-0 mb-6 px-4 py-2 font-black uppercase text-xl md:text-2xl"
            style={{ background: GOLD, border: `3px solid ${INK}`, boxShadow: `4px 4px 0 0 ${INK}` }}
          >
            {certificate.track_title} Track
          </p>
          <p className="m-0 mx-auto mb-10 max-w-xl text-sm md:text-base" style={{ color: '#374151' }}>
            All 10 levels of lessons and boss quizzes, finished with a capstone project
            evaluated by FlyBeta's AI reviewer{certificate.score != null && <> — score <strong>{certificate.score}/100</strong></>}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left sm:text-center">
            <div>
              <p className="uppercase font-bold m-0" style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#6B7280' }}>Completed on</p>
              <p className="font-bold m-0 mt-1">{completedOn}</p>
            </div>
            <div>
              <p className="uppercase font-bold m-0" style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#6B7280' }}>Certificate ID</p>
              <p className="font-mono m-0 mt-1 text-xs break-all">{certificate.certificate_id}</p>
            </div>
          </div>

          <p className="m-0 mt-8 text-xs break-all" style={{ color: '#6B7280' }}>
            Verify at {window.location.href}
          </p>
        </div>
      </article>
    </div>
  );
}
