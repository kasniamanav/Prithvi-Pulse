import { useState, useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet"
import axios from "axios"
import "leaflet/dist/leaflet.css"

const API = "https://prithvi-pulse.onrender.com"

function getColor(csi) {
  if (csi >= 80) return "#ef4444" // Extreme
  if (csi >= 60) return "#f97316" // Very High
  if (csi >= 40) return "#eab308" // High
  if (csi >= 20) return "#22c55e" // Moderate
  return "#3b82f6" // Low
}

function getGlow(csi) {
  if (csi >= 80) return "#ef444480"
  if (csi >= 60) return "#f9731680"
  if (csi >= 40) return "#eab30880"
  if (csi >= 20) return "#22c55e80"
  return "#3b82f680"
}

function getRadius(csi, zoom) {
  const base = csi >= 80 ? 13 : csi >= 60 ? 10 : csi >= 40 ? 8 : 5.5
  return Math.max(base + (zoom - 5) * 0.6, 3)
}

// Auto zoom to selected city
function FlyToCity({ city, allCities }) {
  const map = useMap()
  useEffect(() => {
    if (!city) return
    const found = allCities.find(c => c.name === city)
    if (found) {
      map.flyTo([found.lat, found.lon], 9, { duration: 1.5 })
    }
  }, [city, allCities, map])
  return null
}

// React-Leaflet component for zoom controls
function MapControls() {
  const map = useMap()
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      <button
        onClick={() => map.zoomIn()}
        className="w-9 h-9 bg-[#0f172a]/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-850 rounded-xl flex items-center justify-center font-black cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-md backdrop-blur-md select-none text-base"
      >
        ＋
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-9 h-9 bg-[#0f172a]/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-850 rounded-xl flex items-center justify-center font-black cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shadow-md backdrop-blur-md select-none text-base"
      >
        －
      </button>
    </div>
  )
}

export default function CityMap({ dashboard, onCityClick, selectedCity }) {
  const [allCities, setAllCities] = useState([])
  const [cityScores, setCityScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(5)
  const [hoveredCity, setHoveredCity] = useState(null)

  useEffect(() => {
    fetchAllCities()
  }, [])

  useEffect(() => {
    const scores = {}
    dashboard.forEach(c => {
      scores[c.city.toLowerCase()] = c
    })
    setCityScores(scores)
  }, [dashboard])

  const fetchAllCities = async () => {
    try {
      const res = await axios.get(`${API}/api/cities/coords`)
      setAllCities(res.data.cities || [])
    } catch (e) {
      console.error("Cities fetch failed:", e)
    }
    setLoading(false)
  }

  const scoredCities = allCities.filter(c => cityScores[c.name])
  const unscoredCities = allCities.filter(c => !cityScores[c.name])

  return (
    <div className="h-full w-full relative">

      {/* Loading state overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[#030712]">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="absolute text-xl">🇮🇳</span>
          </div>
          <p className="text-emerald-400 mt-6 font-bold uppercase tracking-widest text-sm animate-pulse">Loading India Map...</p>
          <p className="text-slate-600 text-xs mt-2 font-semibold">Synchronizing 3,000+ national telemetry points</p>
        </div>
      )}

      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
        whenReady={(e) => {
          e.target.on("zoomend", () => setZoom(e.target.getZoom()))
        }}
      >
        {/* Beautiful dark map tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
          maxZoom={18}
        />

        {/* Map custom control hook */}
        <MapControls />

        {/* Fly to selected city */}
        <FlyToCity city={selectedCity} allCities={allCities} />

        {/* Unscored cities — tiny gray dots */}
        {unscoredCities.map(city => (
          <CircleMarker
            key={`u-${city.name}`}
            center={[city.lat, city.lon]}
            radius={zoom >= 8 ? 3 : zoom >= 6 ? 2 : 1.5}
            fillColor="#475569"
            color="#475569"
            weight={0}
            fillOpacity={0.2}
            eventHandlers={{
              click: () => onCityClick(city.name),
              mouseover: () => setHoveredCity(city.name),
              mouseout: () => setHoveredCity(null)
            }}
          >
            {hoveredCity === city.name && (
              <Tooltip direction="top" offset={[0, -4]} permanent>
                <div className="text-slate-900 text-xs font-bold leading-tight">
                  <span className="capitalize">{city.name}</span>
                  <div className="text-slate-400 text-[10px] font-medium mt-0.5">Click to initialize index</div>
                </div>
              </Tooltip>
            )}
          </CircleMarker>
        ))}

        {/* Pulsing ring indicator for high stress cities (CSI >= 40) */}
        {scoredCities.map(city => {
          const score = cityScores[city.name]
          const csi = score.csi
          if (csi < 40) return null

          const color = getColor(csi)
          const radius = getRadius(csi, zoom)
          const isSelected = selectedCity === city.name

          return (
            <CircleMarker
              key={`pulse-${city.name}`}
              center={[city.lat, city.lon]}
              radius={radius + (isSelected ? 10 : 6)}
              fillColor={color}
              color={color}
              weight={1}
              fillOpacity={0.12}
              eventHandlers={{
                click: () => onCityClick(city.name)
              }}
              className="pulse-marker"
            />
          )
        })}

        {/* Scored cities — colored glowing dots */}
        {scoredCities.map(city => {
          const score = cityScores[city.name]
          const csi = score.csi
          const color = getColor(csi)
          const radius = getRadius(csi, zoom)
          const isSelected = selectedCity === city.name

          return (
            <CircleMarker
              key={`s-${city.name}`}
              center={[city.lat, city.lon]}
              radius={isSelected ? radius + 4 : radius}
              fillColor={color}
              color={isSelected ? "#ffffff" : color}
              weight={isSelected ? 2.5 : 1.5}
              fillOpacity={0.95}
              eventHandlers={{
                click: () => onCityClick(city.name),
                mouseover: () => setHoveredCity(city.name),
                mouseout: () => setHoveredCity(null)
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -radius - 4]}
                permanent={isSelected}
              >
                <div className="min-w-[130px] p-0.5 text-slate-900 font-bold select-none">
                  <div className="text-xs capitalize border-b border-slate-100 pb-1 mb-1.5">
                    {city.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{ backgroundColor: color }}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                    />
                    <span className="text-xs text-slate-700">
                      CSI: <strong className="text-slate-900">{csi}</strong> — {score.level}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Top bar — stats */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        <div className="bg-[#0f172a]/75 border border-slate-800/80 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-lg backdrop-blur-md select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-ping" />
          <span className="text-xs font-bold text-slate-300">
            <span className="text-[#22c55e] font-black">{scoredCities.length}</span> cities with live CSI
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-slate-500"><span className="text-slate-400 font-extrabold">{unscoredCities.length}</span> pending</span>
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-[#0f172a]/75 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[180px] animate-fadeIn select-none">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5">
          City Stress Index
        </p>
        <div className="space-y-2.5">
          {[
            { color: "#3b82f6", label: "Low", range: "0–20" },
            { color: "#22c55e", label: "Moderate", range: "20–40" },
            { color: "#eab308", label: "High", range: "40–60" },
            { color: "#f97316", label: "Very High", range: "60–80" },
            { color: "#ef4444", label: "Extreme", range: "80–100" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}80`
                }}
                className="w-3 h-3 rounded-full flex-shrink-0"
              />
              <div className="flex justify-between items-baseline w-full gap-2">
                <span className="text-xs font-bold text-slate-200">{item.label}</span>
                <span className="text-xs font-black text-slate-400">{item.range}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-slate-600/40 border border-slate-700/60 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-400">Click node to load CSI</span>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-6 right-4 z-[1000] bg-[#0f172a]/75 backdrop-blur-md border border-slate-800/80 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 select-none shadow-md">
        Zoom level: {zoom} <span className="text-slate-600 mx-1.5">•</span> Click nodes to select
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .leaflet-container {
          background: #030712 !important;
          font-family: 'Inter', sans-serif;
        }
        .leaflet-tooltip {
          background: #ffffff !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
          padding: 10px 14px !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #ffffff !important;
        }
        .leaflet-control-attribution {
          background: #0f172a90 !important;
          color: #334155 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #475569 !important;
        }
        .pulse-marker {
          animation: marker-pulse 2s infinite ease-in-out;
        }
        @keyframes marker-pulse {
          0%, 100% {
            fill-opacity: 0.05;
            stroke-width: 0;
          }
          50% {
            fill-opacity: 0.35;
            stroke-width: 1px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}