import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch {
      setError("AUTHENTICATION FAILED. PLEASE VERIFY YOUR CREDENTIALS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-brand-stone selection:bg-brand-gold/30">
      {/* Left Column: Atmospheric Visual */}
      <div className="hidden lg:flex relative bg-brand-deep items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
           {/* Abstract architectural lines pattern */}
           <div className="absolute inset-0" style={{
             backgroundImage: "linear-gradient(#c5a059 1px, transparent 1px), linear-gradient(90deg, #c5a059 1px, transparent 1px)",
             backgroundSize: "60px 60px"
           }}></div>
        </div>
        <div className="relative z-10 p-20 max-w-2xl animate-in fade-in slide-in-from-left-10 duration-1000">
          <h2 className="text-7xl font-display text-white leading-tight mb-8">
            The art of <br/>
            <span className="italic text-brand-gold">property</span> <br/>
            intelligence.
          </h2>
          <p className="text-brand-stone/60 text-lg font-light tracking-widest uppercase">
            RE CRM &mdash; Architectural Grade Management
          </p>
        </div>
      </div>

      {/* Right Column: Refined Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl font-display text-brand-deep">Secure Access</h1>
            <p className="text-brand-deep/40 text-sm tracking-wider uppercase">Welcome back to your portfolio control</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs font-medium tracking-wide">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group relative">
                <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/50 mb-2 block transition-colors group-focus-within:text-brand-gold">
                  Account Email
                </label>
                <input
                  className="w-full bg-transparent border-b border-brand-deep/10 py-3 text-brand-deep outline-none focus:border-brand-gold transition-all duration-500"
                  placeholder="name@domain.com" 
                  type="email"
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group relative">
                <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/50 mb-2 block transition-colors group-focus-within:text-brand-gold">
                  Security Passcode
                </label>
                <input
                  className="w-full bg-transparent border-b border-brand-deep/10 py-3 text-brand-deep outline-none focus:border-brand-gold transition-all duration-500"
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full h-14 bg-brand-deep text-white text-xs font-semibold uppercase tracking-[0.3em] hover:bg-brand-gold transition-all duration-700 disabled:opacity-50"
            >
              {loading ? "Establishing Connection..." : "Initialize Session"}
            </button>
          </form>

          <div className="pt-12 text-center">
             <p className="text-[10px] text-brand-deep/30 uppercase tracking-[0.1em]">
               &copy; 2026 RE CRM. Refined Industrial Systems.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
