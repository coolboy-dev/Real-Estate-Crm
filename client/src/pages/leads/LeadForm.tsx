import { useState } from "react";
import type { Lead, LeadSource } from "../../types";

interface Props {
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
}

export default function LeadForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Lead>>({ source: "website", budget: 0 });
  const [saving, setSaving] = useState(false);

  function set(key: keyof Lead, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-12 mb-12 border-t-2 border-brand-gold shadow-xl space-y-12">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl font-display text-brand-deep italic">New Prospect Registration</h2>
        <div className="text-[10px] text-brand-deep/30 uppercase tracking-[0.3em]">Module Ver: 4.2.1</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Full Legal Name</label>
          <input className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm"
            required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Contact Number</label>
          <input className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm"
            required value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Electronic Mail</label>
          <input className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm"
            type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Fiscal Allocation (₹)</label>
          <input className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm"
            type="number" value={form.budget ?? ""} onChange={(e) => set("budget", Number(e.target.value))} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Acquisition Source</label>
          <select className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm uppercase tracking-widest"
            value={form.source} onChange={(e) => set("source", e.target.value as LeadSource)}>
            {(["website", "ads", "call", "referral", "other"] as LeadSource[]).map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-brand-deep/40 block">Specific Preferences</label>
          <input className="w-full bg-transparent border-b border-brand-deep/10 py-2 outline-none focus:border-brand-gold transition-colors text-sm"
            value={form.preferences ?? ""} onChange={(e) => set("preferences", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-6 pt-6 border-t border-brand-deep/5">
        <button type="submit" disabled={saving}
          className="h-12 px-12 bg-brand-deep text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all duration-500 disabled:opacity-50">
          {saving ? "Registering..." : "Finalize Registration"}
        </button>
        <button type="button" onClick={onCancel}
          className="h-12 px-8 border border-brand-deep/10 text-brand-deep/60 text-[10px] uppercase tracking-[0.3em] hover:bg-brand-stone transition-all">
          Abort
        </button>
      </div>
    </form>
  );
}
