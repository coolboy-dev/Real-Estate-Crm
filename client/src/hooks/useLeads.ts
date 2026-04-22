import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { Lead } from "../types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Lead[]>("/leads");
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function createLead(payload: Partial<Lead>) {
    const { data } = await api.post<Lead>("/leads", payload);
    setLeads((prev) => [data, ...prev]);
    return data;
  }

  async function updateStatus(id: number, status: Lead["status"]) {
    const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)));
  }

  return { leads, loading, createLead, updateStatus, refetch: fetchLeads };
}
