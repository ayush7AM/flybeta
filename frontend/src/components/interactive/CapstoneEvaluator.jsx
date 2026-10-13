import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

export default function CapstoneEvaluator({ preselectedDomain = '' }) {
  const { user, updateUser } = useAuth();
  const [domains, setDomains] = useState([]);
  const [domainId, setDomainId] = useState(preselectedDomain);
  const [githubUrl, setGithubUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Fetch domains
    api.get('domains/')
      .then(res => {
        const domainData = res.data.results || res.data;
        setDomains(Array.isArray(domainData) ? domainData : []);
        if (!preselectedDomain && Array.isArray(domainData) && domainData.length > 0) {
            setDomainId(domainData[0].id);
        }
      })
      .catch(err => console.error('Failed to fetch domains:', err));
  }, [preselectedDomain]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domainId || !githubUrl) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('capstone/', {
        domain: domainId,
        github_url: githubUrl
      });
      setResult(res.data);
      if (res.data.user) updateUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-surface border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-xl font-sans my-8">
      <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">AI Capstone Evaluator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-2xl font-black mb-3 uppercase">Select Track</label>
          <div className="relative">
            <select 
              className="w-full p-4 text-xl font-bold border-4 border-black bg-[#f0f0f0] focus:outline-none focus:bg-yellow-300 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose a Track --</option>
              {domains.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-black text-2xl border-l-4 border-black bg-yellow-400">
              ▼
            </div>
          </div>
        </div>
        
        {user ? (
          <>
            <div>
              <label className="block text-2xl font-black mb-3 uppercase">GitHub Repository URL</label>
              <input 
                type="url"
                className="w-full p-4 text-xl font-bold border-4 border-black bg-[#f0f0f0] focus:outline-none focus:bg-blue-200 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-500 placeholder:font-bold"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 text-2xl font-black bg-[#E52E2E] text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff3b3b] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-70 disabled:cursor-wait uppercase tracking-widest"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin w-8 h-8" /> 
                  AI is reading your code...
                </span>
              ) : 'Submit for Review'}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" strokeWidth={2.5} />
            <p className="text-lg font-bold text-gray-600 mb-4">
              Sign in to submit your Capstone project for AI evaluation.
            </p>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="py-4 px-8 text-xl font-black bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--color-primary)] hover:text-black hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest cursor-pointer"
            >
              Sign in to submit your Capstone
            </button>
          </div>
        )}
      </form>

      {error && (
        <div className="mt-8 p-6 border-4 border-black bg-[#ffb3b3] text-black font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <XCircle className="w-10 h-10 flex-shrink-0 text-red-700" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-12 border-4 border-black bg-surface shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
          {result.passed && <Confetti width={width} height={height} recycle={false} numberOfPieces={600} gravity={0.2} />}
          
          <div className={`p-8 border-b-4 border-black flex flex-col md:flex-row items-center justify-between gap-6 ${result.passed ? 'bg-[#4ade80]' : 'bg-[#E52E2E] text-white'}`}>
            <div className="flex items-center gap-5">
              {result.passed ? <CheckCircle className="w-16 h-16 stroke-[3]" /> : <XCircle className="w-16 h-16 stroke-[3]" />}
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                {result.passed ? 'Passed!' : 'Needs Work'}
              </h3>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-black uppercase mb-1 tracking-widest">Score</span>
              <div className="text-5xl md:text-6xl font-black bg-surface text-black px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] leading-none transform -rotate-3">
                {result.score}
              </div>
            </div>
          </div>
          
          {result.reward && (
            <div className="p-6 border-b-4 border-black bg-[#FEF3C7] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="m-0 text-lg font-black uppercase text-center md:text-left">
                {result.reward.first_completion
                  ? `🏆 Track complete! +${result.reward.xp} XP · +${result.reward.coins} coins`
                  : '🏆 Track already completed — nice work polishing it!'}
              </p>
              <Link
                to={`/certificate/${result.reward.certificate_id}`}
                className="px-5 py-3 font-black uppercase bg-black text-white no-underline border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] whitespace-nowrap"
              >
                🎓 View certificate
              </Link>
            </div>
          )}

          <div className="p-8 prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-800 prose-pre:bg-gray-900 prose-pre:text-green-400 prose-pre:border-4 prose-pre:border-black prose-pre:rounded-none prose-pre:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] prose-code:font-bold prose-code:text-pink-600 prose-blockquote:border-l-8 prose-blockquote:border-black prose-blockquote:bg-yellow-100 prose-blockquote:p-4 prose-blockquote:font-bold">
            {/* AI output is shaped by repo content — never render it as HTML */}
            <MarkdownRenderer content={result.ai_feedback} allowHtml={false} />
          </div>
        </div>
      )}

      {/* Auth Gate Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="register"
        customMessage="Sign in to submit your Capstone project and earn your certificate!"
      />
    </div>
  );
}
