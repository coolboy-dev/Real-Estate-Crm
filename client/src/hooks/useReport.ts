import { useState, useEffect } from "react";
import api from "../api/axios";

export interface OverviewKPIs {
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface MonthlyData {
  month: string;
  deals: number;
  revenue: number;
}

export function useReport() {
  const [overview, setOverview] = useState<OverviewKPIs | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<OverviewKPIs>("/reports/overview"),
      api.get<MonthlyData[]>("/reports/monthly"),
    ])
      .then(([ov, mo]) => {
        setOverview(ov.data);
        setMonthly(mo.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { overview, monthly, loading };
}
