import React, { useState } from 'react';
import { supabase, isMockMode } from '../lib/supabase';
import { Mail, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [manual, setManual] = useState(false);
  const [manualLink, setManualLink] = useState('');

  const [redirectOption, setRedirectOption] = useState<'official' | 'current'>('official');

  const getRedirectUrl = () => {
    if (redirectOption === 'official') {
      return 'https://ai.studio/apps/dedfeb7e-d711-4b62-bfaf-243546e1c426';
    }
    return window.location.origin;
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorText('');

    const redirectTo = getRedirectUrl();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);
    if (error) {
      setErrorText(error.message);
    } else {
      setSent(true);
    }
  };

  const handleSimulateMockLogin = async () => {
    localStorage.setItem('supabase_mock_authenticated', 'true');
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-6 animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col"
      >
        {/* Brand Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 text-orange-500 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5a1 1 0 11-2 0 1 1 0 012 0zm-1-3.5a1 1 0 01-1-1V8.5a1 1 0 112 0V12a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FoodFix</h1>
          <p className="text-sm text-slate-400 mt-1">A premium local gourmet delivery app</p>
        </div>

        {!sent ? (
          <form onSubmit={handleMagicLinkLogin} className="flex flex-col gap-5">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-slate-800">Passwordless Sign In</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your email address below, and we'll send a passwordless login link directly to your inbox.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-2xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Redirect Destination
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRedirectOption('official')}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                    redirectOption === 'official'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ai.studio Share Link
                </button>
                <button
                  type="button"
                  onClick={() => setRedirectOption('current')}
                  className={`text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                    redirectOption === 'current'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Local Preview Origin
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-mono truncate max-w-full">
                {getRedirectUrl()}
              </p>
            </div>

            {errorText && (
              <p className="text-xs font-semibold text-red-500 animate-pulse">{errorText}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md shadow-orange-100 hover:shadow-orange-200 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Sending Request...' : 'Send Magic Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-4"
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-950">Check Your Email</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              We've sent a passport-free magic login link to: <br/>
              <strong className="text-slate-800 text-xs font-mono">{email}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
              Upon clicking the link, you will be redirected back to complete your login securely.
            </p>

            {/* If in demo mode, offer mock-sign-in button */}
            {isMockMode && (
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full text-left">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                  <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Demo Mode Active</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
                  This app uses a clean mockup layer because real Supabase keys aren't configured yet. Use this simulation button to test the authenticated page:
                </p>
                <button
                  type="button"
                  onClick={handleSimulateMockLogin}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                >
                  Simulate Email Link Click (Demo)
                </button>
              </div>
            )}

            <button 
              onClick={() => setSent(false)} 
              className="text-orange-500 hover:text-orange-600 text-xs font-bold mt-6 hover:underline"
            >
              &larr; Use a different email address
            </button>
          </motion.div>
        )}

        {/* Manual Redirect Hook for iframe or local tests */}
        <div className="border-t border-slate-100 mt-6 pt-6 flex flex-col items-center">
          {!manual ? (
            <button 
              className="text-slate-400 text-xs hover:text-slate-600 hover:underline cursor-pointer" 
              onClick={() => setManual(true)}
            >
              Have a copy of the login link? Enter manually
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Paste Redirect Link</span>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-slate-800" 
                  placeholder="Paste URL (including tokens)..." 
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                />
                <button 
                  onClick={() => {
                    if (manualLink.trim()) {
                      window.location.href = manualLink.trim();
                    }
                  }} 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  Go
                </button>
              </div>
              <button 
                className="text-slate-400 text-[10px] hover:underline self-start cursor-pointer mt-1" 
                onClick={() => setManual(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
