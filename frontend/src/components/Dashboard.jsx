// src/components/Dashboard.jsx

function getColor(csi) {
  if (csi >= 80) return "#ef4444"
  if (csi >= 60) return "#f97316"
  if (csi >= 40) return "#eab308"
  if (csi >= 20) return "#22c55e"
  return "#3b82f6"
}

function getGlow(csi) {
  if (csi >= 80) return "0 0 20px #ef444440"
  if (csi >= 60) return "0 0 20px #f9731640"
  if (csi >= 40) return "0 0 20px #eab30840"
  if (csi >= 20) return "0 0 20px #22c55e40"
  return "0 0 20px #3b82f640"
}

export default function Dashboard({ dashboard, onCityClick }) {
  const sorted = [...dashboard].sort((a, b) => b.csi - a.csi)

  if (!dashboard.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#64748b" }}>Loading city data...</p>
        </div>
      </div>
    )
  }

  const avg = (dashboard.reduce((a, b) => a + b.csi, 0) / dashboard.length).toFixed(1)

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Title */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
          🇮🇳 India City Stress Dashboard
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Real-time City Stress Index for major Indian cities — updated every hour
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Cities Monitored", value: dashboard.length, color: "#22c55e", icon: "🏙️" },
          { label: "Most Stressed", value: sorted[0]?.city, color: "#ef4444", icon: "🔴", sub: `CSI ${sorted[0]?.csi}` },
          { label: "Least Stressed", value: sorted[sorted.length-1]?.city, color: "#22c55e", icon: "🟢", sub: `CSI ${sorted[sorted.length-1]?.csi}` },
          { label: "Average CSI", value: avg, color: "#eab308", icon: "📊" },
        ].map(card => (
          <div key={card.label} style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            borderRadius: "16px", padding: "20px",
            border: "1px solid #1e293b",
            boxShadow: `0 0 24px ${card.color}20`
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{card.icon}</div>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
              {card.label}
            </p>
            <p style={{ fontSize: "22px", fontWeight: "800", color: card.color, textTransform: "capitalize" }}>
              {card.value}
            </p>
            {card.sub && <p style={{ fontSize: "11px", color: "#64748b" }}>{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* City cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {sorted.map((city, index) => (
          <div
            key={city.city}
            onClick={() => onCityClick(city.city.toLowerCase())}
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              borderRadius: "16px", padding: "20px",
              border: `1px solid ${getColor(city.csi)}30`,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: getGlow(city.csi),
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#334155", fontWeight: "700" }}>#{index+1}</span>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", textTransform: "capitalize" }}>
                  {city.city}
                </h3>
              </div>
              <div style={{
                background: getColor(city.csi),
                color: "#fff", borderRadius: "20px",
                padding: "3px 12px", fontSize: "11px", fontWeight: "600",
                boxShadow: getGlow(city.csi)
              }}>
                {city.level}
              </div>
            </div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "42px", fontWeight: "800", color: getColor(city.csi), lineHeight: 1 }}>
                {city.csi}
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>/ 100</span>
            </div>

            {/* Bar */}
            <div style={{ background: "#1e293b", borderRadius: "4px", height: "6px", marginBottom: "12px" }}>
              <div style={{
                width: `${city.csi}%`, height: "6px",
                background: `linear-gradient(90deg, ${getColor(city.csi)}, ${getColor(city.csi)}aa)`,
                borderRadius: "4px", transition: "width 1s ease"
              }} />
            </div>

            {/* Time */}
            <p style={{ fontSize: "11px", color: "#334155" }}>
              🕐 {new Date(city.timestamp).toLocaleTimeString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}