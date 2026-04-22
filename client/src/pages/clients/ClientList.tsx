import { useState, useEffect } from "react";
import api from "../../api/axios";
import type { Client } from "../../types";

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<Client[]>("/clients")
      .then(({ data }) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading clients…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Clients</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Name", "Phone", "Email", "Type"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    c.type === "buyer" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                  }`}>{c.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-center py-8 text-gray-400">No clients yet.</p>
        )}
      </div>
    </div>
  );
}
