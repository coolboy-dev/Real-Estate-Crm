import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { Deal, DealStage } from "../types";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Deal[]>("/deals");
      setDeals(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  async function moveDeal(id: number, stage: DealStage) {
    const { data } = await api.patch<Deal>(`/deals/${id}/stage`, { stage });
    setDeals((prev) => prev.map((d) => (d.id === id ? data : d)));
  }

  return { deals, loading, moveDeal };
}
