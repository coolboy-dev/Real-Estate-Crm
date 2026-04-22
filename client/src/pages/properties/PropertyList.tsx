import { useState } from "react";
import { useProperties } from "../../hooks/useProperties";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet with React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyList() {
  const { properties, loading } = useProperties();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
       <div className="w-8 h-8 border border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-brand-deep pb-8">
        <div className="space-y-2">
          <p className="text-xs text-brand-gold uppercase tracking-[0.4em] font-semibold italic">Curated Assets</p>
          <h1 className="text-6xl font-display text-brand-deep leading-none">Property Portfolio</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setViewMode("grid")}
             className={`h-10 px-6 text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
               viewMode === "grid" ? "bg-brand-deep text-white" : "border border-brand-deep/10 text-brand-deep/40 hover:bg-brand-stone"
             }`}
           >
              Asset Grid
           </button>
           <button 
             onClick={() => setViewMode("map")}
             className={`h-10 px-6 text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
               viewMode === "map" ? "bg-brand-deep text-white" : "border border-brand-deep/10 text-brand-deep/40 hover:bg-brand-stone"
             }`}
           >
              Geospatial View
           </button>
        </div>
      </header>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {properties.map((p) => (
            <div key={p.id} className="group cursor-pointer">
              <div className="relative overflow-hidden h-[500px] mb-6 bg-brand-deep/5">
                {p.imageUrls[0] ? (
                  <img src={p.imageUrls[0]} alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-deep/10">
                     <p className="font-display italic text-4xl">Image Pending</p>
                  </div>
                )}
                <div className="absolute top-6 right-6">
                  <span className={`px-4 py-1 glass text-[10px] uppercase tracking-[0.2em] font-bold ${
                    p.status === "available" ? "text-emerald-700" : "text-brand-deep/40"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display text-brand-deep group-hover:text-brand-gold transition-colors">{p.title}</h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-brand-deep/40">{p.location} &bull; {p.sizeSqft} SQFT</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-display italic text-brand-deep">₹{(p.price / 10000000).toFixed(2)} Cr</p>
                   <p className="text-[10px] uppercase tracking-tighter text-brand-deep/30 mt-1">Valuation Grade: A+</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[700px] glass p-1 animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
           <MapContainer 
             center={[28.6139, 77.2090]} 
             zoom={11} 
             className="h-full w-full grayscale-[0.5] contrast-[1.1]"
           >
             <TileLayer
               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
             />
             {properties.map((p) => p.latitude && p.longitude && (
               <Marker key={p.id} position={[p.latitude, p.longitude]}>
                 <Popup>
                    <div className="p-2 space-y-2">
                       <p className="font-display italic text-brand-deep font-bold">{p.title}</p>
                       <p className="text-[10px] uppercase tracking-widest text-brand-gold">₹{(p.price / 10000000).toFixed(2)} Cr</p>
                       <p className="text-[9px] uppercase text-brand-deep/40">{p.location}</p>
                    </div>
                 </Popup>
               </Marker>
             ))}
           </MapContainer>
        </div>
      )}

      {properties.length === 0 && (
        <div className="py-32 text-center border-2 border-dashed border-brand-deep/5">
           <p className="text-3xl font-display italic text-brand-deep/20 tracking-tight">Portfolio inventory is currently being updated.</p>
        </div>
      )}
    </div>
  );
}
