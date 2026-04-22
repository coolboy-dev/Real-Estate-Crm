import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadList from "./pages/leads/LeadList";
import PropertyList from "./pages/properties/PropertyList";
import ClientList from "./pages/clients/ClientList";
import DealKanban from "./pages/deals/DealKanban";
import ReportsDashboard from "./pages/reports/ReportsDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="properties" element={<PropertyList />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="deals" element={<DealKanban />} />
            <Route path="reports" element={<ReportsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
