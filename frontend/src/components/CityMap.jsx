// src/components/CityMap.jsx
import { useState, useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet"
import axios from "axios"
import "leaflet/dist/leaflet.css"

const API = "http://127.0.0.1:8000"

function getColor(csi) {
  if (csi >= 80) return "#ef4444"
  if (csi >= 60) return "#f97316"
  if (csi >= 40) return "#eab308"
  if (csi >= 20) return "#22c55e"
  return "#3b82f6"
}

function getRadius(csi) {
  if (csi >= 80) return 20
  if (csi >= 60) return 16
  if (csi >= 40) return 13
  return 10
}

export default function CityMap({ dashboard, onCityClick, selectedCity }) {
  const [allCities,  setAllCities]  = useState([])
  const [cityScores, setCityScores] = useState({})
  const [loading,    setLoading]    = useState(true)

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

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center",
          justifyContent: "center", background: "#0f172a"
        }}>
          <div style={{ color: "#22c55e", fontSize: "18px" }}>
            🌍 Loading India map...
          </div>
        </div>
      )}

      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        {/* Dark map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />

        {/* All Indian city dots */}
        {allCities.map((city) => {
          const score  = cityScores[city.name]
          const csi    = score ? score.csi  : null
          const color  = csi   ? getColor(csi)  : "#64748b"
          const radius = csi   ? getRadius(csi) : 4

          return (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lon]}
              radius={radius}
              fillColor={color}
              color={selectedCity === city.name ? "#ffffff" : color}
              weight={selectedCity === city.name ? 3 : 1}
              fillOpacity={csi ? 0.85 : 0.25}
              eventHandlers={{
                click: () => onCityClick(city.name)
              }}
            >
              <Tooltip direction="top" offset={[0, -5]}>
                <div style={{ color: "#000", minWidth: "120px" }}>
                  <strong style={{ textTransform: "capitalize" }}>
                    {city.name}
                  </strong>
                  {csi ? (
                    <div>CSI: {csi} — {score.level}</div>
                  ) : (
                    <div style={{ color: "#666" }}>Click to load CSI</div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: "24px", left: "24px",
        zIndex: 1000, background: "#1e293b", borderRadius: "12px",
        padding: "16px", border: "1px solid #334155"
      }}>
        <p style={{ fontSize: "11px", fontWeight: "bold", color: "#cbd5e1", marginBottom: "8px" }}>
          City Stress Index
        </p>
        {[
          { color: "#3b82f6", label: "Low (0–20)" },
          { color: "#22c55e", label: "Moderate (20–40)" },
          { color: "#eab308", label: "High (40–60)" },
          { color: "#f97316", label: "Very High (60–80)" },
          { color: "#ef4444", label: "Extreme (80–100)" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.label}</span>
          </div>
        ))}
        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#64748b", opacity: 0.3 }} />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>No data yet</span>
          </div>
        </div>
      </div>

      {/* City count badge */}
      <div style={{
        position: "absolute", top: "16px", left: "16px",
        zIndex: 1000, background: "#1e293b", borderRadius: "8px",
        padding: "8px 12px", border: "1px solid #334155"
      }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          🏙️ {allCities.length} Indian cities loaded
        </span>
      </div>

    </div>
  )
}