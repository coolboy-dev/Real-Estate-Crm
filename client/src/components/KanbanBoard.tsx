import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { Deal, DealStage } from "../types";

const STAGES: DealStage[] = ["negotiation", "agreement", "closed"];
const STAGE_LABELS: Record<DealStage, string> = {
  negotiation: "In Negotiation",
  agreement: "Contract Binding",
  closed: "Closed Portfolio",
};
const STAGE_COLORS: Record<DealStage, string> = {
  negotiation: "border-brand-gold/30",
  agreement: "border-brand-gold",
  closed: "border-brand-emerald",
};

interface Props {
  deals: Deal[];
  onMove: (id: number, stage: DealStage) => void;
}

export default function KanbanBoard({ deals, onMove }: Props) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const stage = result.destination.droppableId as DealStage;
    const id = Number(result.draggableId);
    onMove(id, stage);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
        {STAGES.map((stage) => (
          <Droppable key={stage} droppableId={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-shrink-0 w-[350px] snap-center transition-colors duration-500 rounded-sm p-4 ${
                  snapshot.isDraggingOver ? "bg-brand-deep/[0.02]" : "bg-transparent"
                }`}
              >
                <header className={`mb-8 border-b-2 pb-4 ${STAGE_COLORS[stage]}`}>
                   <div className="flex justify-between items-end">
                      <h2 className="text-lg font-display italic text-brand-deep uppercase tracking-widest">
                        {STAGE_LABELS[stage]}
                      </h2>
                      <span className="text-[10px] font-bold text-brand-deep/30 tabular-nums tracking-tighter">
                        {deals.filter((d) => d.stage === stage).length} Units
                      </span>
                   </div>
                </header>

                <div className="space-y-4 min-h-[500px]">
                  {deals
                    .filter((d) => d.stage === stage)
                    .map((deal, index) => (
                      <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`glass p-6 group cursor-grab active:cursor-grabbing transition-all duration-300 ${
                              snap.isDragging ? "shadow-2xl scale-105 rotate-2 z-50 border-brand-gold" : "hover:border-brand-gold/50"
                            }`}
                          >
                            <p className="text-[9px] uppercase tracking-[0.3em] text-brand-deep/40 mb-3">Ref ID: {deal.id.toString().padStart(4, '0')}</p>
                            <h3 className="font-display text-lg text-brand-deep group-hover:text-brand-gold transition-colors mb-4">{deal.title}</h3>
                            
                            <div className="flex justify-between items-end pt-4 border-t border-brand-deep/5">
                               <div>
                                  <p className="text-[10px] uppercase tracking-widest text-brand-deep/40">Valuation</p>
                                  <p className="text-sm font-medium text-brand-deep italic">₹{(deal.salePrice / 10000000).toFixed(2)} Cr</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Earn: ₹{((deal.salePrice * deal.commissionRate) / 100).toLocaleString()}</p>
                               </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
