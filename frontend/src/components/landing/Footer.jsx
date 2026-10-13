import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer id="contact" className="border-t-8 border-ink bg-surface transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left — Brand */}
          <div>
            <div className="mb-4">
              <Logo to="/" />
            </div>
            <p className="text-muted text-sm leading-relaxed mt-4 italic border-l-4 border-ink pl-4 transition-colors">
              "The only way to learn to code is to code. 
              The only way to fly is to jump."
            </p>
            <p className="mt-4 text-muted opacity-80 text-xs font-bold uppercase tracking-wider transition-colors">
              Built with 💚 for curious minds everywhere.
            </p>
          </div>

          {/* Center — Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-ink mb-6 border-b-4 border-ink pb-2 inline-block transition-colors">
              QUICK LINKS
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'TRACKS', path: '/tracks' },
                { label: 'LABS', path: '/labs' },
                { label: 'VISION', path: '/vision' },
              ].map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-ink hover:text-ink hover:bg-[#EAB308] font-bold uppercase text-sm tracking-wider no-underline border-2 border-transparent hover:border-ink px-3 py-1 transition-all inline-block"
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Contact */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-ink mb-6 border-b-4 border-ink pb-2 inline-block transition-colors">
              CONTACT US!
            </h4>
            <p className="text-muted text-sm leading-relaxed font-semibold transition-colors">
              Got questions, feedback, or just want to say hi?
            </p>
            <a
              href="mailto:hello@flybeta.dev"
              className="inline-block mt-4 px-6 py-3 bg-ink text-surface font-black uppercase text-sm tracking-wider no-underline border-4 border-ink shadow-[4px_4px_0px_0px_var(--color-primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-all"
            >
              ✉️ HELLO@FLYBETA.DEV
            </a>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t-4 border-ink text-center transition-colors">
          <p className="text-muted opacity-80 text-xs font-bold uppercase tracking-wider transition-colors">
            © {new Date().getFullYear()} FLYBETA. ALL RIGHTS RESERVED. BUILT FOR LEARNERS, BY LEARNERS.
          </p>
        </div>
      </div>
    </footer>
  );
}
