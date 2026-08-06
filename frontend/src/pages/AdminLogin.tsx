import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, isAuthenticated } from "../services/auth.js";
import { Shield, Mail, Lock, Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCognitoConfigured = !!import.meta.env.VITE_COGNITO_CLIENT_ID;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-400 font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Site</span>
      </Link>

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-100">
            Admin Sign In
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to manage your portfolio data and blog posts.
          </p>
        </div>

        {/* Local Mock Auth Notice */}
        {!isCognitoConfigured && (
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs flex items-start space-x-2 leading-relaxed">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Local Mock Mode Enabled</p>
              <p>AWS credentials not detected. Sign in using:</p>
              <p className="mt-1 font-mono">Email: admin@example.com</p>
              <p className="font-mono">Password: Admin123!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500/50 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
            id="admin-login-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
