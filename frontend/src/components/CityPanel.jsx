// src/components/CityPanel.jsx
import { useState } from "react"

function getColor(csi) {
  if (csi >= 80) return "#ef4444"
  if (csi >= 60) return "#f97316"
  if (csi >= 40) return "#eab308"
  if (csi >= 20) return "#22c55e"
  return "#3b82f6"
}

function getBgColor(csi) {
  if (csi >= 80) return "#ef444420"
  if (csi >= 60) return "#f9731620"
  if (csi >= 40) return "#eab30820"
  if (csi >= 20) return "#22c55e20"
  return "#3b82f620"
}

function Bar({ label, value }) {
  const color = getColor(value)
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: "12px", color: "#fff", fontWeight: "600" }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div style={{ width: "100%", background: "#334155", borderRadius: "4px", height: "6px" }}>
        <div style={{
          width: `${value}%`,
          background: color,
          height: "6px",
          borderRadius: "4px",
          transition: "width 0.5s ease"
        }} />
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
    <div style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search any Indian city..."
          style={{
            flex: 1, background: "#334155", color: "#fff",
            border: "1px solid #475569", borderRadius: "8px",
            padding: "8px 12px", fontSize: "13px", outline: "none"
          }}
        />
        <button
          type="submit"
          style={{
            background: "#22c55e", color: "#fff", border: "none",
            borderRadius: "8px", padding: "8px 16px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer"
          }}
        >
          Go
        </button>
      </form>

      {/* Empty state */}
      {!city && !loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
            Click any city dot on the map or search above to see its City Stress Index
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "32px", height: "32px",
            border: "2px solid #22c55e",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "12px"
          }} />
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>Fetching live data...</p>
        </div>
      )}

      {/* City data */}
      {data && !loading && (
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* City name */}
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", textTransform: "capitalize" }}>
              {data.city}
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>India • Live data</p>
          </div>

          {/* CSI Score card */}
          <div style={{
            background: getBgColor(data.csi),
            border: `1px solid ${getColor(data.csi)}40`,
            borderRadius: "12px", padding: "20px",
            marginBottom: "16px", textAlign: "center"
          }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              City Stress Index
            </p>
            <p style={{ fontSize: "56px", fontWeight: "700", color: getColor(data.csi), lineHeight: 1, marginBottom: "8px" }}>
              {data.csi}
            </p>
            <div style={{
              display: "inline-block", background: getColor(data.csi),
              color: "#fff", borderRadius: "20px",
              padding: "4px 16px", fontSize: "13px", fontWeight: "600"
            }}>
              {data.emoji} {data.level}
            </div>
          </div>

          {/* Parameter breakdown */}
          <div style={{
            background: "#0f172a", borderRadius: "12px",
            padding: "16px", marginBottom: "16px",
            border: "1px solid #1e293b"
          }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Parameter Breakdown
            </p>
            <Bar label="💨 Air Quality (AQI)"   value={data.breakdown.aqi} />
            <Bar label="🚗 Traffic Congestion"   value={data.breakdown.traffic} />
            <Bar label="🌤️ Weather Stress"       value={data.breakdown.weather} />
            <Bar label="👥 Population Density"   value={data.breakdown.population} />
            <Bar label="🔊 Noise Pollution"      value={data.breakdown.noise} />
          </div>

          {/* Formula weights */}
          <div style={{
            background: "#0f172a", borderRadius: "12px",
            padding: "16px", border: "1px solid #1e293b"
          }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              CSI Formula Weights
            </p>
            {Object.entries(data.weights).map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", textTransform: "capitalize" }}>{key}</span>
                <span style={{ fontSize: "12px", color: "#fff", fontWeight: "600" }}>
                  {(val * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}