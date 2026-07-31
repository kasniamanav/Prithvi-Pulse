import { useState, useEffect } from "react"

function getColor(csi) {
  if (csi >= 80) return "#ef4444" // Extreme (Red)
  if (csi >= 60) return "#f97316" // Very High (Orange)
  if (csi >= 40) return "#eab308" // High (Yellow)
  if (csi >= 20) return "#22c55e" // Moderate (Green)
  return "#3b82f6" // Low (Blue)
}

function getGradientClass(val) {
  if (val >= 80) return "from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
  if (val >= 60) return "from-orange-500 to-amber-600 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
  if (val >= 40) return "from-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
  if (val >= 20) return "from-green-400 to-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
  return "from-blue-400 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
}

// Circular Gauge component
function CircularGauge({ value }) {
  const color = getColor(value)
  const r = 50
  const circ = 2 * Math.PI * r // ~314.16
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const timer = setTimeout(() => {
      const percentage = value / 100
      setOffset(circ - percentage * circ)
    }, 100)
    return () => clearTimeout(timer)
  }, [value, circ])

  return (
    <div className="relative flex flex-col items-center justify-center py-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 my-5 shadow-inner">
      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
        {/* Background Dial Track */}
        <circle
          cx="60"
          cy="60"
          r={r}
          className="stroke-slate-800/40"
          strokeWidth="9"
          fill="none"
        />
        {/* Glowing Dial Overlay */}
        <circle
          cx="60"
          cy="60"
          r={r}
          stroke={color}
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 6px ${color}cc)`
          }}
        />
      </svg>
      {/* Central Labels */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-black">CSI Score</span>
        <span
          style={{ color }}
          className="text-4xl font-black tracking-tighter leading-none mt-1.5"
        >
          {value}
        </span>
        <span className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  )
}

// Parameter Breakdown Bar
function Bar({ label, value }) {
  const [width, setWidth] = useState("0%")

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(`${value}%`)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-extrabold text-white">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-slate-950/60 rounded-full h-3 overflow-hidden border border-slate-900/60 p-[2px]">
        <div
          style={{ width }}
          className={`h-full rounded-full bg-gradient-to-r ${getGradientClass(value)} transition-all duration-1000 ease-out`}
        />
      </div>
    </div>
  )
}

export default function CityPanel({ city, data, loading, onSearch }) {
  const [input, setInput] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input.trim().toLowerCase())
      setInput("")
    }
  }

  return (
    <div className="p-5 h-full flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Prominent Search bar - perfectly aligned h-10 */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs select-none">🔍</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search Indian city..."
              className="w-full h-10 bg-[#1e293b]/40 text-white placeholder-slate-500 border border-slate-800 focus:border-[#22c55e]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.15)] rounded-xl pl-9 pr-3 text-xs font-semibold outline-none transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            className="h-10 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#22C55E]/90 hover:to-[#16A34A]/90 text-white border-0 rounded-xl px-5 text-xs font-extrabold shadow-[0_4px_12px_rgba(34,197,94,0.15)] hover:scale-[1.02] active:scale-95 cursor-pointer transition-all duration-205"
          >
            Search
          </button>
        </form>

        {/* Empty state */}
        {!city && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/20 backdrop-blur-sm">
            <div className="text-4xl mb-4 select-none animate-pulse">🗺️</div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">City Spotlight</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto font-medium">
              Click any active node on the map or search a city above to inspect multi-dimensional stress telemetry.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#22c55e] text-xs font-extrabold uppercase tracking-widest animate-pulse">Syncing Telemetry...</p>
          </div>
        )}

        {/* City detailed data */}
        {data && !loading && (
          <div className="space-y-5 animate-slideIn">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-white capitalize tracking-tight leading-none">
                  {data.city}
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">India • Real-time telemetry</p>
              </div>
              <div
                style={{
                  backgroundColor: `${getColor(data.csi)}15`,
                  color: getColor(data.csi),
                  borderColor: `${getColor(data.csi)}40`
                }}
                className="border rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1 select-none"
              >
                <span>{data.emoji}</span>
                <span>{data.level}</span>
              </div>
            </div>

            {/* Circular score dial display */}
            <CircularGauge value={data.csi} />

            {/* Parameter Breakdown */}
            <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Telemetry Breakdown
              </p>
              <div className="space-y-4">
                <Bar label="💨 Air Quality Index" value={data.breakdown.aqi} />
                <Bar label="🚗 Traffic Congestion" value={data.breakdown.traffic} />
                <Bar label="🌤️ Climate Stress" value={data.breakdown.weather} />
                <Bar label="👥 Population Stress" value={data.breakdown.population} />
                <Bar label="🔊 Noise Telemetry" value={data.breakdown.noise} />
              </div>
            </div>

            {/* CSI Weights */}
            <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Index Coefficients
              </p>
              <div className="divide-y divide-slate-800/40">
                {Object.entries(data.weights).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider capitalize">{key}</span>
                    <span className="text-xs text-slate-200 font-extrabold">{(val * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}