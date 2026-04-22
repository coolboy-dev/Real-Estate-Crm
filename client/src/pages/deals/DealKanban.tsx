import { useDeals } from "../../hooks/useDeals";
import KanbanBoard from "../../components/KanbanBoard";

export default function DealKanban() {
  const { deals, loading, moveDeal } = useDeals();

  if (loading) return <p className="text-gray-500">Loading deals…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Deal Pipeline</h1>
      <KanbanBoard deals={deals} onMove={moveDeal} />
    </div>
  );
}
