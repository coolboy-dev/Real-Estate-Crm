import { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
import type { LeadStatus } from "../../types";
import LeadForm from "./LeadForm";

const STATUS_STYLING: Record<LeadStatus, string> = {
  new: "text-blue-500",
  contacted: "text-amber-600",
  qualified: "text-emerald-600",
  closed: "text-brand-deep font-bold",
  lost: "text-red-400 line-through opacity-50",
};

export default function LeadList() {
  const { leads, loading, createLead, updateStatus } = useLeads();
  const [showForm, setShowForm] = useState(false);

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
       <div className="w-8 h-8 border border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-brand-deep pb-8">
        <div className="space-y-2">
          <p className="text-xs text-brand-gold uppercase tracking-[0.4em] font-semibold italic">Acquisition Module</p>
          <h1 className="text-6xl font-display text-brand-deep leading-none">Incoming Leads</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-12 px-8 bg-brand-deep text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all duration-500"
        >
          {showForm ? "Dismiss Form" : "Register Prospect"}
        </button>
      </header>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <LeadForm
            onSubmit={async (data) => {
              await createLead(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-deep/10">
              {["Prospect Identity", "Fiscal Budget", "Channel Source", "Current Status", "Workflow Control"].map((h) => (
                <th key={h} className="pb-6 text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 font-semibold px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-deep/5">
            {leads.map((lead) => (
              <tr key={lead.id} className="group hover:bg-white transition-colors duration-500">
                <td className="py-8 px-4">
                  <div className="space-y-1">
                    <p className="text-lg font-display text-brand-deep group-hover:text-brand-gold transition-colors">{lead.name}</p>
                    <p className="text-[10px] text-brand-deep/40 uppercase tracking-widest">{lead.phone} &bull; {lead.email}</p>
                  </div>
                </td>
                <td className="py-8 px-4">
                  <p className="text-sm font-light text-brand-deep italic">₹{lead.budget?.toLocaleString()}</p>
                </td>
                <td className="py-8 px-4">
                  <span className="text-[10px] uppercase tracking-widest text-brand-deep/60">{lead.source}</span>
                </td>
                <td className="py-8 px-4">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${STATUS_STYLING[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-8 px-4">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className="bg-transparent text-[9px] uppercase tracking-widest border border-brand-deep/10 px-3 py-2 outline-none focus:border-brand-gold transition-all"
                  >
                    {(["new", "contacted", "qualified", "closed", "lost"] as LeadStatus[]).map(
                      (s) => <option key={s} value={s}>{s.toUpperCase()}</option>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {leads.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-2xl font-display italic text-brand-deep/20">No active prospects in database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
