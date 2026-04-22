import { sequelize } from "../config/db.js";
import { Lead } from "../models/Lead.js";
import { Deal } from "../models/Deal.js";
import { QueryTypes } from "sequelize";

import ExcelJS from "exceljs";

export async function getOverviewKPIs() {
  const totalLeads = await Lead.count();
  const totalDeals = await Deal.count();

  const revenueResult = await sequelize.query<{ total: string }>(
    `SELECT COALESCE(SUM("salePrice"), 0) AS total FROM deals WHERE stage = 'closed'`,
    { type: QueryTypes.SELECT }
  );
  const totalRevenue = parseFloat(revenueResult[0]?.total ?? "0");

  const conversionResult = await sequelize.query<{ rate: string }>(
    `SELECT ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM leads),0) * 100, 2) AS rate
     FROM leads WHERE status = 'closed'`,
    { type: QueryTypes.SELECT }
  );
  const conversionRate = parseFloat(conversionResult[0]?.rate ?? "0");

  return { totalLeads, totalDeals, totalRevenue, conversionRate };
}

export async function exportReportsToExcel() {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Overview
  const overview = await getOverviewKPIs();
  const mainSheet = workbook.addWorksheet('Strategic Overview');
  mainSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  mainSheet.addRows([
    { metric: 'Cumulative Leads', value: overview.totalLeads },
    { metric: 'Unit Acquisitions', value: overview.totalDeals },
    { metric: 'Gross Portfolio (₹)', value: overview.totalRevenue },
    { metric: 'Conversion Index (%)', value: overview.conversionRate }
  ]);

  // Sheet 2: Agent Performance
  const agents = await getAgentPerformance();
  const agentSheet = workbook.addWorksheet('Agent Performance');
  agentSheet.columns = [
    { header: 'Agent Identity', key: 'name', width: 30 },
    { header: 'Total Units', key: 'total_deals', width: 15 },
    { header: 'Earned Commission (₹)', key: 'total_commission', width: 25 }
  ];
  agentSheet.addRows(agents);

  return workbook;
}

export async function getMonthlyDeals() {
  return sequelize.query(
    `SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*) AS deals,
     SUM("salePrice") AS revenue
     FROM deals GROUP BY month ORDER BY month`,
    { type: QueryTypes.SELECT }
  );
}

export async function getAgentPerformance() {
  return sequelize.query(
    `SELECT u.name, COUNT(d.id) AS total_deals,
     COALESCE(SUM(d."salePrice" * d."commissionRate" / 100), 0) AS total_commission
     FROM users u LEFT JOIN deals d ON d."agentId" = u.id
     WHERE u.role = 'agent' GROUP BY u.id, u.name ORDER BY total_deals DESC`,
    { type: QueryTypes.SELECT }
  );
}
