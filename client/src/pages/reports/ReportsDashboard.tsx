import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useReport } from "../../hooks/useReport";
import api from "../../api/axios";

function KPICard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass p-8 border-t-2 border-brand-gold hover-lift">
      <p className="text-[10px] text-brand-deep/40 uppercase tracking-[0.3em] font-bold mb-4">{label}</p>
      <p className="text-4xl font-display text-brand-deep">{value}</p>
      <div className="mt-4 pt-4 border-t border-brand-deep/5">
         <p className="text-[9px] uppercase tracking-tighter text-brand-emerald font-bold italic">
            Performance: Optimal Target
         </p>
      </div>
    </div>
  );
}

export default function ReportsDashboard() {
  const { overview, monthly, loading } = useReport();

  async function handleExport() {
    try {
      const response = await api.get("/reports/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Portfolio_Intelligence_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  }

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
       <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!overview) return (
    <div className="py-32 text-center">
       <p className="text-3xl font-display italic text-brand-deep/20">Awaiting intelligence data feed...</p>
    </div>
  );

  return (
    <div className="space-y-16">
      <header className="flex justify-between items-end border-b border-brand-deep pb-8">
        <div className="space-y-2">
          <p className="text-xs text-brand-gold uppercase tracking-[0.4em] font-semibold italic">Intelligence Unit</p>
          <h1 className="text-6xl font-display text-brand-deep leading-none">Fiscal Performance</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleExport}
             className="h-10 px-6 border border-brand-deep/10 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-brand-stone transition-all"
           >
              Export Intelligence (Excel)
           </button>
           <button className="h-10 px-6 bg-brand-deep text-white text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all">
              Live Data Feed
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Cumulative Leads" value={overview.totalLeads} />
        <KPICard label="Unit Acquisitions" value={overview.totalDeals} />
        <KPICard label="Gross Portfolio" value={`₹${(overview.totalRevenue / 10000000).toFixed(2)} Cr`} />
        <KPICard label="Conversion Index" value={`${overview.conversionRate}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 space-y-8">
          <div className="flex justify-between items-start">
             <h2 className="text-2xl font-display italic text-brand-deep">Revenue Trajectory</h2>
             <span className="text-[10px] uppercase tracking-widest text-brand-deep/40 font-bold tabular-nums">Fiscal Period: 2026</span>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a10" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#1a1a1a40', letterSpacing: '0.1em' }} 
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#1a1a1a40' }}
                  tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '0' }}
                  itemStyle={{ color: '#c5a059', fontSize: '10px', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#ffffff50', fontSize: '8px', marginBottom: '4px' }}
                  formatter={(v: any) => [`₹${Number(v || 0).toLocaleString()}`, 'REVENUE']} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c5a059" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#c5a059', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-deep p-10 text-white space-y-12">
          <div className="space-y-2">
             <h2 className="text-2xl font-display italic">Acquisition Volume</h2>
             <p className="text-[10px] text-brand-stone/40 uppercase tracking-widest">Units per Fiscal Interval</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <Bar 
                  dataKey="deals" 
                  fill="#c5a059" 
                  radius={[2, 2, 0, 0]}
                  barSize={30}
                />
                <XAxis dataKey="month" hide />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#f5f5f0', border: 'none', borderRadius: '0' }}
                   itemStyle={{ color: '#1a1a1a', fontSize: '10px', fontWeight: 'bold' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-8 border-t border-white/10">
             <p className="text-[9px] text-brand-stone/30 leading-relaxed uppercase tracking-widest">
                Data synthesized through real-time portfolio monitoring. Discrepancies may exist during live synchronization cycles.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
