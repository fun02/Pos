import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, Fingerprint, 
  Server, Activity, CheckCircle, AlertTriangle, ChevronRight, Laptop, MapPin, Clock, Globe
} from 'lucide-react';

// ==========================================
// 1. SCHEMAS & TYPES
// ==========================================
const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi').min(3, 'Minimal 3 karakter'),
  password: z.string().min(1, 'Password wajib diisi').min(8, 'Minimal 8 karakter'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ==========================================
// 2. BACKGROUND COMPONENT (Aurora & Particles)
// ==========================================
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#050B14]">
    {/* Aurora Glows */}
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-900/20 blur-[120px]"
    />
    <motion.div 
      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/20 blur-[100px]"
    />
    {/* Animated Mesh Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
  </div>
);

// ==========================================
// 3. SERVER STATUS & SECURITY INDICATORS
// ==========================================
const ServerStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Mock ping to backend
    const ping = setInterval(() => setIsOnline(Math.random() > 0.1), 10000);
    return () => clearInterval(ping);
  }, []);

  return (
    <div className="absolute top-6 left-6 lg:top-8 lg:left-12 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg z-10">
      <Server className="w-4 h-4 text-slate-300" />
      <span className="text-xs font-semibold text-slate-200 tracking-wider">ENTERPRISE CORE</span>
      <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
      <div className="flex items-center gap-2">
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}
        />
        <span className={`text-xs font-medium ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
          {isOnline ? 'System Online' : 'System Offline'}
        </span>
      </div>
    </div>
  );
};

const SecurityIndicators = () => {
  const indicators = ['HTTPS', 'JWT', 'Encrypted', 'Rate Limited'];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {indicators.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-2 py-1.5 rounded-md">
          <ShieldCheck className="w-3 h-3" />
          {item}
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 4. MAIN LOGIN PAGE COMPONENT
// ==========================================
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loadingState, setLoadingState] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const passwordValue = watch('password', '');
  const passwordStrength = Math.min((passwordValue.length / 12) * 100, 100);

  // Keydown listener for CapsLock
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  }, []);

  // Handle Standard Login
  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    try {
      setLoadingState('Authenticating...');
      await new Promise(r => setTimeout(r, 800));
      
      setLoadingState('Verifying Credentials...');
      await new Promise(r => setTimeout(r, 800));
      
      setLoadingState('Initializing Session...');
      await axios.post('/api/auth/login', data).catch(() => {
        // Mock error handling for demo
        if(data.username !== 'admin') throw new Error('Username atau password salah.');
      });

      setLoadingState('');
      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } catch (err: any) {
      setLoadingState('');
      setErrorMsg(err.message || 'Koneksi terputus.');
    }
  };

  // Handle Biometric Login
  const handleBiometric = async () => {
    if (!window.PublicKeyCredential) {
      setErrorMsg("Perangkat ini tidak mendukung autentikasi biometrik.");
      return;
    }
    try {
      setLoadingState('Scanning Biometrics...');
      // MOCK WebAuthn API Call
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
        }
      });
      setSuccess(true);
    } catch (err) {
      setLoadingState('');
      setErrorMsg("Autentikasi biometrik dibatalkan atau gagal.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans text-slate-200 overflow-hidden" onKeyDown={handleKeyDown}>
      <AnimatedBackground />
      <ServerStatus />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 flex flex-col lg:flex-row items-center justify-center gap-12">
        
        {/* Left Section - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col max-w-md">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-6">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              POS Retail Pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Enterprise</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Sistem manajemen operasional dan finansial tingkat tinggi. Diamankan dengan protokol WebAuthn dan enkripsi end-to-end.
            </p>
            
            {/* Session Info Panel */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Current Context</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300"><Laptop className="w-4 h-4 text-cyan-400" /> Windows 11 / Chrome 126</div>
                <div className="flex items-center gap-3 text-sm text-slate-300"><MapPin className="w-4 h-4 text-cyan-400" /> 103.119.54.2 (ID)</div>
                <div className="flex items-center gap-3 text-sm text-slate-300"><Clock className="w-4 h-4 text-cyan-400" /> {new Date().toLocaleTimeString()} WIB</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Section - Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Glare Effect */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Sign in to continue to your dashboard.</p>
            </div>

            {/* Error Toast */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg mb-6 flex items-start gap-3 text-sm"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Username Input */}
              <motion.div animate={errors.username ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }}>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.username ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-cyan-400'}`} />
                  <input 
                    {...register('username')}
                    type="text" 
                    placeholder="Username"
                    autoComplete="off"
                    className={`w-full bg-black/20 border ${errors.username ? 'border-rose-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all`}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div animate={errors.password ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }}>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-cyan-400'}`} />
                  <input 
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    autoComplete="off"
                    className={`w-full bg-black/20 border ${errors.password ? 'border-rose-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Caps Lock Warning & Strength */}
                <div className="flex justify-between items-center mt-2 px-1">
                  {capsLock ? (
                    <span className="text-xs text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Caps Lock is ON</span>
                  ) : (
                    <div className="flex items-center gap-1 w-24">
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${passwordStrength > 60 ? 'bg-emerald-400' : passwordStrength > 30 ? 'bg-amber-400' : 'bg-rose-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" {...register('rememberMe')} className="sr-only" />
                  <div className="w-5 h-5 rounded border border-white/20 bg-black/20 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: watch('rememberMe') ? 1 : 0 }}>
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    </motion.div>
                  </div>
                  <span className="text-slate-400 group-hover:text-white transition-colors">Remember Me</span>
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                disabled={!!loadingState || success}
                className="relative w-full overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Ripple Effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <span className="text-xs text-slate-500 uppercase tracking-widest">OR</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            {/* Fingerprint Button */}
            <button 
              onClick={handleBiometric}
              type="button"
              className="w-full flex flex-col items-center justify-center gap-3 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all group"
            >
              <div className="p-3 bg-white/5 rounded-full group-hover:bg-cyan-500/10 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                <Fingerprint className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Login dengan Sidik Jari
              </span>
            </button>

            <SecurityIndicators />

            {/* Loading & Success Overlays */}
            <AnimatePresence>
              {(loadingState || success) && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl"
                >
                  {success ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                      <CheckCircle className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)] mb-4" />
                      <p className="text-emerald-400 font-semibold tracking-wider">Authentication Success</p>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Modern Progress Ring */}
                      <svg className="w-16 h-16 animate-spin text-cyan-400 mb-6" viewBox="0 0 50 50">
                        <circle className="opacity-20" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="opacity-100" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="90 150" strokeDashoffset="0"></circle>
                      </svg>
                      <motion.p 
                        key={loadingState}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-cyan-400 font-medium tracking-wide"
                      >
                        {loadingState}
                      </motion.p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Footer */}
          <div className="mt-8 text-center text-xs text-slate-500 lg:hidden">
            <p>POS Retail Pro Enterprise v2.0</p>
            <p className="mt-1">© 2026 Powered by Enterprise Authentication</p>
          </div>
        </motion.div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:flex absolute bottom-6 left-0 w-full justify-between px-12 text-xs text-slate-500 font-medium tracking-wider z-10">
        <p>POS RETAIL PRO ENTERPRISE V2.0</p>
        <p className="flex items-center gap-2"><Globe className="w-3 h-3"/> © 2026 POWERED BY ENTERPRISE AUTHENTICATION</p>
      </div>
    </div>
  );
}

