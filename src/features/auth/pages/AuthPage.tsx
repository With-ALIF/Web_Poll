import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_EMAILS } from '../constants';
import { isConfigured, configuredUrl, configuredAnonKey } from '../../../lib/supabase';
import AuthHeader from '../components/AuthHeader';
import AuthForm from '../components/AuthForm';
import AdminContactList from '../components/AdminContactList';
import AdminRequestModal from '../components/AdminRequestModal';
import SignUpAccessInfo from '../components/SignUpAccessInfo';
import { useAdminRequest } from '../hooks/useAdminRequest';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '', show: false });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { loginWithEmail, signUpWithEmailAuth, resetPasswordAuth } = useAuth();
  const navigate = useNavigate();
  const adminReq = useAdminRequest();

  const handleResetPassword = async () => {
    if (!creds.email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await resetPasswordAuth(creds.email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isSignUp) {
        await signUpWithEmailAuth(creds.email, creds.password);
        navigate('/');
      } else {
        const user = await loginWithEmail(creds.email, creds.password);
        if (user && user.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) navigate('/system-stats');
        else navigate('/');
      }
    } catch (err: any) {
      console.error('Auth handler error:', err);
      let msg = 'Authentication failed. Please try again.';
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password. Please verify and try again.';
      else if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      else if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      else if (err.message) msg = err.message;
      setError(msg);
    }
  };

  const hasConfigError = !isConfigured || 
    error.toLowerCase().includes('fetch failed') || 
    error.toLowerCase().includes('enotfound') || 
    error.toLowerCase().includes('network-request-failed') ||
    error.toLowerCase().includes('cors') ||
    (configuredUrl && !configuredUrl.startsWith('http'));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <AuthHeader />
        <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        {hasConfigError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-amber-900 text-xs shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <span className="text-sm">📢</span>
              <span>Supabase Connection Guide / হেল্প গাইড</span>
            </div>
            
            <p className="text-amber-800 leading-relaxed text-[11px]">
              আপনার Supabase ডাটাবেস সংযোগটি সঠিকভাবে কনফিগার করা নেই অথবা URL ভুল। এটি ঠিক করতে নীচের ধাপগুলো অনুসরণ করুন:
            </p>
            
            <div className="space-y-1.5 bg-white/70 p-2.5 rounded-xl border border-amber-100 font-mono text-[10px] text-slate-705">
              <div>
                <span className="font-semibold text-emerald-700">VITE_SUPABASE_URL</span>:
                <div className="truncate bg-slate-100/80 px-1.5 py-0.5 rounded mt-0.5 text-[9px] selection:bg-amber-100">
                  {configuredUrl || "সেট করা নেই (e.g. https://your-proj.supabase.co)"}
                </div>
                {configuredUrl && !configuredUrl.startsWith('https://') && (
                  <p className="text-[9px] text-red-600 font-sans mt-0.5 font-bold">⚠️ URL must start with https://</p>
                )}
              </div>
              <div className="mt-1">
                <span className="font-semibold text-emerald-700">VITE_SUPABASE_ANON_KEY</span>:
                <div className="truncate bg-slate-100/80 px-1.5 py-0.5 rounded mt-0.5 text-[9px]">
                  {configuredAnonKey ? "••••••••••••••••••••" : "সেট করা নেই"}
                </div>
              </div>
            </div>

            <div className="text-amber-950 space-y-1 leading-relaxed text-[11px] pt-1">
              <p className="font-semibold">🛠️ কিভাবে সেটিং করবেন:</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[10px]">
                <li>ডানদিকের <strong>Settings &gt; Secrets</strong> মেনুতে যান।</li>
                <li><strong>VITE_SUPABASE_URL</strong> এবং <strong>VITE_SUPABASE_ANON_KEY</strong> সঠিক মান দিয়ে সেট করুন।</li>
                <li>সার্ভার অ্যাক্সেস এর জন্য <strong>SUPABASE_SERVICE_ROLE_KEY</strong> ও সেট করুন।</li>
              </ol>
            </div>
          </div>
        )}

        {error && !!isConfigured && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-600 text-sm">
            <div className="shrink-0 p-1 bg-red-100 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-medium">
              {error.toLowerCase().includes('network-request-failed') 
                ? 'Network connection error. please refresh the page or check your internet.' 
                : error}
            </p>
          </div>
        )}
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 flex items-center gap-3 text-emerald-600 text-sm">
            <div className="shrink-0 p-1 bg-emerald-100 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">{message}</p>
          </div>
        )}
        {isSignUp ? (
          <div className="space-y-6">
            <SignUpAccessInfo />
            <AdminContactList onAdminClick={adminReq.handleAdminClick} showAdmins={adminReq.showAdmins} setShowAdmins={adminReq.setShowAdmins} />
          </div>
        ) : (
          <div className="space-y-4">
            <AuthForm isSignUp={false} email={creds.email} setEmail={e => setCreds({...creds, email: e})} password={creds.password} setPassword={e => setCreds({...creds, password: e})} showPassword={creds.show} setShowPassword={s => setCreds({...creds, show: s})} onSubmit={handleAuth} />
          </div>
        )}
        <AuthToggle isSignUp={isSignUp} onToggle={() => setIsSignUp(!isSignUp)} />
      </div>
      <AdminRequestModal isOpen={adminReq.showRequestModal} onClose={adminReq.closeRequestModal} selectedAdmin={adminReq.selectedAdmin} form={adminReq.requestForm} setForm={adminReq.setRequestForm} />
    </div>
  );
}

function AuthToggle({ isSignUp, onToggle }: any) {
  return (
    <p className="mt-6 text-center text-sm text-slate-600">
      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      <button onClick={onToggle} className="text-blue-600 font-medium ml-1">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
    </p>
  );
}
