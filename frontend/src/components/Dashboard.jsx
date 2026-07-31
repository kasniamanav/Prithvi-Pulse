import { useState, useEffect } from "react"

// Color matching helper
function getColor(csi) {
  if (csi >= 80) return "#ef4444" // Extreme (Red)
  if (csi >= 60) return "#f97316" // Very High (Orange)
  if (csi >= 40) return "#eab308" // High (Yellow)
  if (csi >= 20) return "#22c55e" // Moderate (Green)
  return "#3b82f6" // Low (Blue)
}

function getGlow(csi) {
  if (csi >= 80) return "0 4px 20px rgba(239, 68, 68, 0.12)"
  if (csi >= 60) return "0 4px 20px rgba(249, 115, 22, 0.12)"
  if (csi >= 40) return "0 4px 20px rgba(234, 179, 8, 0.12)"
  if (csi >= 20) return "0 4px 20px rgba(34, 197, 94, 0.12)"
  return "0 4px 20px rgba(59, 130, 246, 0.12)"
}

function getHoverShadow(csi) {
  if (csi >= 80) return "0 12px 30px rgba(239, 68, 68, 0.4)"
  if (csi >= 60) return "0 12px 30px rgba(249, 115, 22, 0.4)"
  if (csi >= 40) return "0 12px 30px rgba(234, 179, 8, 0.4)"
  if (csi >= 20) return "0 12px 30px rgba(34, 197, 94, 0.4)"
  return "0 12px 30px rgba(59, 130, 246, 0.4)"
}

// Relative time formatter
function getRelativeTime(timestamp) {
  if (!timestamp) return "Just now"
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins === 1) return "1 min ago"
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return "1 hour ago"
  if (diffHours < 24) return `${diffHours} hours ago`

  return then.toLocaleDateString("en-IN")
}

// Animated Counter component that handles decimals
function AnimatedCounter({ value, duration = 800, decimals = 0 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const end = parseFloat(value)
    if (isNaN(end) || end <= 0) {
      setCount(value || 0)
      return
    }

    const startTime = performance.now()

    let animationFrameId
    const updateCount = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = progress * end
      setCount(current.toFixed(decimals))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setCount(end.toFixed(decimals))
      }
    }

    animationFrameId = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration, decimals])

  return <span>{count}</span>
}

// Mini Sparkline component that uses deterministic values based on name seed
function MiniSparkline({ csi, name }) {
  const points = []
  const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  for (let i = 0; i < 6; i++) {
    const variance = Math.sin(seed + i) * 15
    const val = Math.max(10, Math.min(95, csi + variance))
    points.push(val)
  }

  const width = 100
  const height = 30
  const step = width / (points.length - 1)
  const pathD = points
    .map((val, idx) => {
      const x = idx * step
      const y = height - (val / 100) * height
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  const color = getColor(csi)

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold select-none">CSI Trend</span>
      <svg className="w-24 h-7 opacity-85" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sparkline-path"
        />
      </svg>
    </div>
  )
}

// Single City Card with hover animations
function CityCard({ city, index, onCityClick }) {
  const [hovered, setHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const color = getColor(city.csi)

  return (
    <div
      onClick={() => onCityClick(city.city.toLowerCase())}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? getHoverShadow(city.csi) : getGlow(city.csi),
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        animation: `fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${index * 60}ms`,
      }}
      className="city-card-custom bg-[#0f172a]/45 backdrop-blur-md border border-slate-800/80 rounded-2xl flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all duration-300 group"
    >
      {/* Left accent border matching stress color */}
      <div
        style={{ backgroundColor: color }}
        className="absolute left-0 top-0 bottom-0 w-[5px] transition-all duration-300"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          {/* Rank circle badge */}
          <div
            style={{
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}40`
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border select-none"
          >
            #{index + 1}
          </div>
          <h3 className="text-base font-extrabold text-white capitalize group-hover:text-emerald-400 transition-colors duration-200">
            {city.city}
          </h3>
        </div>
        <div
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}40`,
            boxShadow: `0 0 12px ${color}20`
          }}
          className="border rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider select-none"
        >
          {city.level}
        </div>
      </div>

      {/* CSI Score and Sparkline */}
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{ color: color }}
            className="text-4xl font-extrabold tracking-tight"
          >
            {city.csi}
          </span>
          <span className="text-xs font-bold text-slate-500">/100</span>
        </div>

        {/* Sparkline trend */}
        <MiniSparkline csi={city.csi} name={city.city} />
      </div>

      {/* Score Progress Bar */}
      <div className="w-full bg-slate-950/60 rounded-full h-2.5 mt-3 mb-4 overflow-hidden border border-slate-800/30">
        <div
          style={{
            width: isMounted ? `${city.csi}%` : "0%",
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 10px ${color}50`
          }}
          className="h-full rounded-full transition-all duration-1000 ease-out"
        />
      </div>

      {/* Relative Time Footer */}
      <div className="flex items-center justify-between text-xs text-slate-405 font-medium mt-1">
        <span className="flex items-center gap-1">
          <span className="text-[12px]">🕐</span> {getRelativeTime(city.timestamp)}
        </span>
        <span className="text-xs uppercase font-extrabold text-slate-450 group-hover:text-[#22c55e] transition-colors duration-200">
          Details →
        </span>
      </div>
    </div>
  )
}

export default function Dashboard({ dashboard, onCityClick }) {
  const sorted = [...dashboard].sort((a, b) => b.csi - a.csi)

  if (!dashboard.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="absolute text-2xl">🌍</span>
        </div>
        <p className="text-slate-400 mt-4 font-semibold animate-pulse">Loading real-time city index data...</p>
      </div>
    )
  }

  const avg = (dashboard.reduce((a, b) => a + b.csi, 0) / dashboard.length).toFixed(1)

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto space-y-8">
      
      {/* Title / Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🇮🇳</span> India City Stress Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time multi-dimensional stress evaluation (Air Quality, Traffic, Noise, Weather) across Indian metropolises.
          </p>
        </div>
        <div className="bg-[#0f172a]/60 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm select-none">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hourly Automated Update</span>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Cities Monitored",
            value: dashboard.length,
            gradient: "from-blue-600/80 to-cyan-600/80",
            glow: "shadow-blue-500/10",
            icon: "🏙️",
            desc: "Telemetry feeds"
          },
          {
            label: "Most Stressed",
            value: sorted[0]?.city,
            sub: `CSI: ${sorted[0]?.csi}`,
            gradient: "from-red-600/80 to-orange-700/80",
            glow: "shadow-red-500/10",
            icon: "🚨",
            desc: "Needs urgent action"
          },
          {
            label: "Least Stressed",
            value: sorted[sorted.length - 1]?.city,
            sub: `CSI: ${sorted[sorted.length - 1]?.csi}`,
            gradient: "from-emerald-600/80 to-teal-750/80",
            glow: "shadow-emerald-500/10",
            icon: "🍃",
            desc: "Highly liveable state"
          },
          {
            label: "Average CSI",
            value: avg,
            isDecimal: true,
            gradient: "from-amber-600/80 to-yellow-605/80",
            glow: "shadow-amber-500/10",
            icon: "📊",
            desc: "Index balance"
          },
        ].map((card, idx) => (
          <div
            key={card.label}
            style={{
              animation: `fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
              animationDelay: `${idx * 100}ms`
            }}
            className={`summary-card-custom relative bg-gradient-to-br ${card.gradient} rounded-2xl border border-white/10 shadow-lg ${card.glow} flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
          >
            {/* SVG Animated Pattern Backdrop */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay overflow-hidden rounded-2xl pointer-events-none">
              <svg className="w-full h-full wave-anim" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M-20,30 Q30,50 50,20 T120,40 L120,100 L-20,100 Z" fill="rgba(255,255,255,0.5)" />
                <path d="M-10,50 Q40,20 60,60 T130,30 L130,100 L-10,100 Z" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>

            <div className="flex justify-between items-center z-10 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">{card.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-sm shadow-sm border border-white/10 select-none">
                {card.icon}
              </div>
            </div>

            <div className="z-10 mt-1.5">
              {typeof card.value === "number" || card.isDecimal ? (
                <p className="text-3xl font-extrabold text-white tracking-tight leading-none">
                  <AnimatedCounter value={card.value} decimals={card.isDecimal ? 1 : 0} />
                </p>
              ) : (
                <p className="text-xl font-extrabold text-white capitalize tracking-tight leading-none truncate max-w-[90%]">
                  {card.value}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-xs font-bold text-white/70 pl-0.5">{card.desc}</p>
                {card.sub && (
                  <span className="text-xs font-extrabold text-white bg-white/20 rounded-full px-2 py-0.5 select-none text-[11px]">
                    {card.sub}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cities Cards Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Rankings</span>
          <div className="h-[1px] bg-slate-800 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((city, index) => (
            <CityCard
              key={city.city}
              city={city}
              index={index}
              onCityClick={onCityClick}
            />
          ))}
        </div>
      </div>

      <style>{`
        .summary-card-custom {
          padding: 20px !important;
        }
        .city-card-custom {
          padding: 24px !important;
          padding-left: 28px !important;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .wave-anim path {
          animation: wave-flow 12s ease-in-out infinite alternate;
        }
        .wave-anim path:nth-child(2) {
          animation-duration: 8s;
          animation-delay: -2s;
        }
        @keyframes wave-flow {
          0% { d: path("M-20,30 Q30,50 50,20 T120,40 L120,100 L-20,100 Z"); }
          50% { d: path("M-20,40 Q20,10 60,35 T120,30 L120,100 L-20,100 Z"); }
          100% { d: path("M-20,25 Q40,45 70,15 T120,45 L120,100 L-20,100 Z"); }
        }
        .sparkline-path {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: draw-line 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

    </div>
  )
}