import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { Property } from "../types";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async (filters: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get<Property[]>("/properties", { params: filters });
      setProperties(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  async function createProperty(payload: Partial<Property>) {
    const { data } = await api.post<Property>("/properties", payload);
    setProperties((prev) => [data, ...prev]);
    return data;
  }

  return { properties, loading, createProperty, refetch: fetchProperties };
}
