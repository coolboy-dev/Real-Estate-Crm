import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/leads", label: "Acquisitions" },
  { to: "/properties", label: "Portfolio" },
  { to: "/clients", label: "Relations" },
  { to: "/deals", label: "Pipelines" },
  { to: "/reports", label: "Intelligence" },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-brand-stone selection:bg-brand-gold/20">
      {/* Editorial Sidebar */}
      <aside className="w-72 bg-brand-deep text-white flex flex-col p-8 border-r border-brand-deep shadow-2xl z-20">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 border-2 border-brand-gold rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-gold -rotate-45"></div>
            </div>
            <h1 className="text-xl font-display tracking-widest uppercase">RE CRM</h1>
          </div>
          <p className="text-[10px] text-brand-stone/40 tracking-[0.3em] uppercase ml-11">Systems Group</p>
        </div>

        <nav className="flex-1 space-y-6">
          <div className="text-[10px] text-brand-stone/30 uppercase tracking-[0.2em] mb-4 pl-2">Navigation</div>
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `group flex items-center justify-between py-2 pl-2 transition-all duration-500 ${
                  isActive ? "text-brand-gold" : "text-brand-stone/60 hover:text-brand-stone"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-sm tracking-widest uppercase font-light">{n.label}</span>
                  <div className={`h-px bg-brand-gold transition-all duration-500 ${isActive ? "w-8" : "w-0 group-hover:w-4"}`}></div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                <span className="text-brand-gold text-xs font-semibold">{auth?.user.name.charAt(0)}</span>
             </div>
             <div>
                <p className="text-xs font-medium text-brand-stone uppercase tracking-wide">{auth?.user.name}</p>
                <p className="text-[10px] text-brand-stone/40 uppercase tracking-tighter">{auth?.user.role}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 hover:text-red-400 transition-colors w-full text-left pl-1"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 overflow-auto relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{
           backgroundImage: "radial-gradient(#1a1a1a 1px, transparent 1px)",
           backgroundSize: "40px 40px"
        }}></div>
        
        <div className="relative z-10 min-h-full p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
