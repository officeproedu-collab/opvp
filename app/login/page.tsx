'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
import { supabase } from '@/lib/supabase';      
import { setUser, getUser } from '@/lib/auth';
import { Play, Lock, Mail, Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react';
import logo from '../../assets/logo1.png';
import ashengImage from '../../assets/asheng1.png';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    if (user) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('portal_users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError('Invalid email or password.');
        return;
      }

      if (!data.is_active) {
        setError('Your account has been deactivated. Please contact the administrator.');
        return;
      }

      setUser(data);
      router.replace(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,15%,8%)] via-[hsl(220,15%,6%)] to-[hsl(220,15%,4%)]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-sky-400/5 blur-3xl" />
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={logo.src} 
                alt="OfficePro Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-600 tracking-tight text-foreground">OfficePro Education Institute</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-700 leading-tight tracking-tight">
              Learn at your<br />
              <span className="text-gradient">own pace.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              Access your course videos anytime, anywhere. Your learning journey starts here.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: '01', text: 'Login with your student account' },
              { icon: '02', text: 'Access all your course videos' },
              { icon: '03', text: 'Learn at your own schedule' },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-fade-in"
                style={{ animationDelay: `${i * 100 + 200}ms`, opacity: 0 }}
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-600">{step.icon}</span>
                </div>
                <span className="text-sm text-muted-foreground">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground/50">
          OfficePro Video Portal &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col justify-between p-6 lg:p-12 min-h-screen">
        <div /> {/* Top spacer to help center the card vertically */}

        <div className="w-full max-w-md mx-auto my-auto animate-scale-in" style={{ animationDelay: '100ms', opacity: 0 }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <img 
                src={logo.src} 
                alt="OfficePro Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-600 text-foreground">OfficePro Education</span>
          </div>

          {/* Lecturer Profile Card */}
          {/* <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-md mb-3 bg-secondary/50 flex items-center justify-center">
              <img 
                src={ashengImage.src} 
                alt="Lecturer" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <p className="text-sm font-600 text-foreground">
              Lecturer - K. B. V. Ashen Lalantha (B.Eng Software Engineer)
            </p>
          </div> */}

          <div className="space-y-1 mb-6 text-center">
            <h2 className="text-2xl font-700 tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to access your videos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-500 text-foreground/80">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-500 text-foreground/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 pl-10 pr-11 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-500 text-sm transition-all duration-200 flex items-center justify-center gap-2 glow-blue-sm hover:glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>

        {/* Center-aligned copyright statement */}
        {/* <p className="text-center text-xs text-muted-foreground/50 mt-8">
          OfficePro Video Portal &copy; {new Date().getFullYear()}
        </p> */}
      </div>
    </div>
  );
}
