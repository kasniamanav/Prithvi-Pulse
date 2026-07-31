import { useState, useEffect } from "react"

function AnimatedCounter({ value, duration = 800 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value, 10)
    if (isNaN(end) || end <= 0) {
      setCount(value || 0)
      return
    }
    if (start === end) {
      setCount(end)
      return
    }

    const startTime = performance.now()

    let animationFrameId
    const updateCount = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(progress * end)
      setCount(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setCount(end)
      }
    }

    animationFrameId = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration])

  return <span>{count}</span>
}

export default function Header({ view, setView, totalCities, lastUpdated }) {
  const [formattedTime, setFormattedTime] = useState("")

  useEffect(() => {
    if (lastUpdated instanceof Date) {
      setFormattedTime(lastUpdated.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }))
    }
  }, [lastUpdated])

  return (
    <header className="min-h-[68px] bg-[#030712]/75 backdrop-blur-md border-b border-[#22c55e]/20 flex items-center justify-between px-6 py-3 z-[1000] shadow-[0_4px_30px_rgba(0,0,0,0.6)] sticky top-0">
      
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-4">
        {/* Circular Badge with Earth/Pulse Icon */}
        <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] overflow-hidden border border-emerald-400/20 group">
          {/* Earth Icon Backdrop */}
          <span className="text-xl z-10 select-none group-hover:scale-110 transition-transform duration-300">🌍</span>
          {/* Subtle Pulse/Heartbeat line SVG overlay */}
          <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100" fill="none">
            <path
              d="M10,50 L35,50 L42,30 L50,70 L58,40 L65,50 L90,50"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pulse-path"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight flex items-center gap-1">
            Prithvi <span className="text-[#22C55E] drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">Pulse</span>
          </h1>
          <p className="text-xs font-bold text-[#22C55E] tracking-[1.5px] uppercase select-none">
            City Stress Index
          </p>
        </div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="flex gap-1.5 bg-[#0f172a]/80 border border-slate-800 p-1.5 rounded-xl backdrop-blur-md">
        {[
          { key: "map", label: "🗺️ Map" },
          { key: "dashboard", label: "📊 Dashboard" },
        ].map(({ key, label }) => {
          const isActive = view === key
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[0_0_15px_rgba(34,197,94,0.45)] border border-emerald-400/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              {label}
            </button>
          )
        })}
      </nav>

      {/* Right Side Stats & Live Indicator */}
      <div className="flex items-center gap-5">
        {/* Last Updated Time */}
        {formattedTime && (
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Last Sync</span>
            <span className="text-xs text-white font-medium">{formattedTime}</span>
          </div>
        )}

        {/* Cities Monitored Counter Badge */}
        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <span className="text-sm select-none">🏙️</span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Cities</span>
            <span className="text-sm text-[#22c55e] font-extrabold leading-none">
              <AnimatedCounter value={totalCities} />
            </span>
          </div>
        </div>

        {/* Breathing Live Indicator */}
        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E] shadow-[0_0_10px_#22c55e]"></span>
          </span>
          <span className="text-xs font-extrabold text-[#22C55E] tracking-[1.5px] uppercase select-none animate-pulse-slow">
            Live
          </span>
        </div>
      </div>

      <style>{`
        .pulse-path {
          stroke-dasharray: 60 120;
          animation: pulse-flow 2.5s linear infinite;
        }
        @keyframes pulse-flow {
          0% {
            stroke-dashoffset: 180;
          }
          100% {
            stroke-dashoffset: -180;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px rgba(34,197,94,0.6)); }
          50% { opacity: 0.6; filter: drop-shadow(0 0 6px rgba(34,197,94,0.8)); }
        }
      `}</style>
    </header>
  )
}