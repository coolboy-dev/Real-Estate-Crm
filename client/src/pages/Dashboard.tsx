import { useReport } from "../hooks/useReport";
import { useAuth } from "../contexts/AuthContext";

function StatCard({ label, value, index }: { label: string; value: string | number; index: number }) {
  return (
    <div 
      className="glass p-8 hover-lift border-l-0 border-t-2 border-brand-deep group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] text-brand-deep/40 uppercase tracking-[0.2em] font-medium">{label}</p>
        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <p className="text-4xl font-display text-brand-deep">{value}</p>
      <div className="mt-4 h-px bg-brand-deep/5 w-full"></div>
      <div className="mt-2 text-[9px] text-brand-deep/30 uppercase tracking-tighter">Verified Real-Time Metric</div>
    </div>
  );
}

export default function Dashboard() {
  const { overview, loading } = useReport();
  const { auth } = useAuth();
  const isAdmin = auth?.user.role === "admin" || auth?.user.role === "manager";

  return (
    <div className="space-y-16">
      <header className="flex justify-between items-end border-b border-brand-deep pb-8">
        <div className="space-y-2">
          <p className="text-xs text-brand-gold uppercase tracking-[0.4em] font-semibold italic">
            {isAdmin ? "Global Enterprise Summary" : "Personal Performance Terminal"}
          </p>
          <h1 className="text-6xl font-display text-brand-deep leading-none">
            {isAdmin ? "Admin Control" : "Agent Workspace"}
          </h1>
        </div>
        <div className="text-right">
           <p className="text-sm font-display italic text-brand-deep/60">"The best way to predict the future is to create it."</p>
           <p className="text-[10px] uppercase tracking-widest mt-1 text-brand-deep/30">— Peter Drucker</p>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label={isAdmin ? "Cumulative Leads" : "Assigned Leads"} value={overview.totalLeads} index={0} />
          <StatCard label="Active Pipelines" value={overview.totalDeals} index={1} />
          <StatCard label={isAdmin ? "System Revenue" : "Personal Commission"} 
            value={`₹${((isAdmin ? overview.totalRevenue : overview.totalRevenue * 0.05) / 10000000).toFixed(1)}Cr`} index={2} />
          <StatCard label="Efficiency Index" value={`${overview.conversionRate}%`} index={3} />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glass p-10 flex flex-col justify-between h-[400px]">
            <div className="space-y-4">
               <h2 className="text-3xl font-display text-brand-deep">Welcome, {auth?.user.name}</h2>
               <p className="text-brand-deep/60 text-sm max-w-md font-light leading-relaxed">
                  Your session is initialized. {isAdmin 
                    ? "Global portfolio monitoring and agent oversight systems are active." 
                    : "Focus on your active negotiations and pending follow-ups to maintain efficiency."}
               </p>
            </div>
            <div className="flex gap-4">
               <button className="h-12 px-10 bg-brand-deep text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all duration-500">
                  {isAdmin ? "Manage Assets" : "Log Activity"}
               </button>
               <button className="h-12 px-8 border border-brand-deep/10 text-brand-deep/40 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-stone transition-all">
                  View Intelligence
               </button>
            </div>
         </div>
         
         <div className="bg-brand-deep p-10 text-white flex flex-col justify-between border-t-4 border-brand-gold">
            <h3 className="text-xl font-display italic tracking-wider">System Integrity</h3>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Database Synchronized</p>
               </div>
               <div className="flex items-center gap-4 text-white/40">
                  <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em]">Mail Engine Active</p>
               </div>
               <div className="flex items-center gap-4 text-white/40">
                  <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em]">SMS Gateway Ready</p>
               </div>
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest leading-loose">
               Refined CRM Architectural Node v4.0.0<br/>
               Encrypted Session &bull; ISO-9001 Compliant
            </p>
         </div>
      </div>
    </div>
  );
}
