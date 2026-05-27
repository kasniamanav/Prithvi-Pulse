import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet"
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

function getGlow(csi) {
  if (csi >= 80) return "#ef444480"
  if (csi >= 60) return "#f9731680"
  if (csi >= 40) return "#eab30880"
  if (csi >= 20) return "#22c55e80"
  return "#3b82f680"
}

function getRadius(csi, zoom) {
  const base = csi >= 80 ? 14 : csi >= 60 ? 11 : csi >= 40 ? 9 : 6
  return Math.max(base + (zoom - 5) * 0.5, 3)
}

// Auto zoom to selected city
function FlyToCity({ city, allCities }) {
  const map = useMap()
  useEffect(() => {
    if (!city) return
    const found = allCities.find(c => c.name === city)
    if (found) {
      map.flyTo([found.lat, found.lon], 10, { duration: 1.5 })
    }
  }, [city])
  return null
}

export default function CityMap({ dashboard, onCityClick, selectedCity }) {
  const [allCities,  setAllCities]  = useState([])
  const [cityScores, setCityScores] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [zoom,       setZoom]       = useState(5)
  const [hoveredCity, setHoveredCity] = useState(null)

  useEffect(() => { fetchAllCities() }, [])

  useEffect(() => {
    const scores = {}
    dashboard.forEach(c => { scores[c.city.toLowerCase()] = c })
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

  const scoredCities   = allCities.filter(c => cityScores[c.name])
  const unscoredCities = allCities.filter(c => !cityScores[c.name])

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>

      {/* Loading */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#030712"
        }}>
          <div style={{
            width: "48px", height: "48px",
            border: "3px solid #22c55e",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "16px"
          }} />
          <p style={{ color: "#22c55e", fontSize: "16px", fontWeight: "600" }}>
            Loading India map...
          </p>
          <p style={{ color: "#334155", fontSize: "12px", marginTop: "8px" }}>
            Fetching 3000+ city coordinates
          </p>
        </div>
      )}

      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        whenReady={e => {
          e.target.on("zoomend", () => setZoom(e.target.getZoom()))
        }}
      >
        {/* Beautiful dark map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
          maxZoom={18}
        />

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
            fillOpacity={0.25}
            eventHandlers={{
              click: () => onCityClick(city.name),
              mouseover: () => setHoveredCity(city.name),
              mouseout:  () => setHoveredCity(null)
            }}
          >
            {hoveredCity === city.name && (
              <Tooltip direction="top" offset={[0, -4]} permanent>
                <div style={{ color: "#000", fontSize: "12px" }}>
                  <strong style={{ textTransform: "capitalize" }}>{city.name}</strong>
                  <div style={{ color: "#666" }}>Click to load CSI</div>
                </div>
              </Tooltip>
            )}
          </CircleMarker>
        ))}

        {/* Scored cities — colored glowing dots */}
        {scoredCities.map(city => {
          const score    = cityScores[city.name]
          const csi      = score.csi
          const color    = getColor(csi)
          const glow     = getGlow(csi)
          const radius   = getRadius(csi, zoom)
          const isSelected = selectedCity === city.name

          return (
            <CircleMarker
              key={`s-${city.name}`}
              center={[city.lat, city.lon]}
              radius={isSelected ? radius + 4 : radius}
              fillColor={color}
              color={isSelected ? "#ffffff" : color}
              weight={isSelected ? 3 : 1.5}
              fillOpacity={0.9}
              eventHandlers={{
                click:     () => onCityClick(city.name),
                mouseover: () => setHoveredCity(city.name),
                mouseout:  () => setHoveredCity(null)
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -radius - 4]}
                permanent={isSelected}
              >
                <div style={{ minWidth: "140px", padding: "2px" }}>
                  <div style={{
                    fontWeight: "700", fontSize: "13px",
                    textTransform: "capitalize", color: "#111",
                    marginBottom: "4px"
                  }}>
                    {city.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{
                      width: "8px", height: "8px",
                      borderRadius: "50%", background: color,
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: "12px", color: "#333" }}>
                      CSI: <strong>{csi}</strong> — {score.level}
                    </span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Top bar — stats */}
      <div style={{
        position: "absolute", top: "16px", left: "50%",
        transform: "translateX(-50%)", zIndex: 1000,
        display: "flex", gap: "8px"
      }}>
        <div style={{
          background: "#0f172acc", backdropFilter: "blur(10px)",
          borderRadius: "10px", padding: "8px 16px",
          border: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            <span style={{ color: "#22c55e", fontWeight: "700" }}>{scoredCities.length}</span> cities with live CSI •&nbsp;
            <span style={{ color: "#475569" }}>{unscoredCities.length}</span> pending
          </span>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: "absolute", right: "16px", top: "50%",
        transform: "translateY(-50%)", zIndex: 1000,
        display: "flex", flexDirection: "column", gap: "4px"
      }}>
        {["+", "−"].map((btn, i) => (
          <button
            key={btn}
            onClick={() => {
              const map = document.querySelector(".leaflet-container")?._leaflet_map
            }}
            style={{
              width: "36px", height: "36px",
              background: "#0f172acc", backdropFilter: "blur(10px)",
              border: "1px solid #1e293b", borderRadius: "8px",
              color: "#94a3b8", fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: "24px", left: "16px",
        zIndex: 1000,
        background: "#0f172acc", backdropFilter: "blur(16px)",
        borderRadius: "14px", padding: "16px 20px",
        border: "1px solid #1e293b",
        boxShadow: "0 8px 32px #00000060"
      }}>
        <p style={{
          fontSize: "10px", fontWeight: "700", color: "#64748b",
          textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px"
        }}>
          City Stress Index
        </p>
        {[
          { color: "#3b82f6", label: "Low",       range: "0–20" },
          { color: "#22c55e", label: "Moderate",  range: "20–40" },
          { color: "#eab308", label: "High",       range: "40–60" },
          { color: "#f97316", label: "Very High",  range: "60–80" },
          { color: "#ef4444", label: "Extreme",    range: "80–100" },
        ].map(item => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center",
            gap: "10px", marginBottom: "8px"
          }}>
            <div style={{
              width: "12px", height: "12px", borderRadius: "50%",
              background: item.color,
              boxShadow: `0 0 8px ${item.color}80`,
              flexShrink: 0
            }} />
            <div>
              <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "600" }}>
                {item.label}
              </span>
              <span style={{ fontSize: "11px", color: "#475569", marginLeft: "6px" }}>
                {item.range}
              </span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "12px", height: "12px", borderRadius: "50%",
              background: "#475569", opacity: 0.4, flexShrink: 0
            }} />
            <span style={{ fontSize: "11px", color: "#475569" }}>Click to load CSI</span>
          </div>
        </div>
      </div>

      {/* Scale indicator */}
      <div style={{
        position: "absolute", bottom: "24px", right: "16px",
        zIndex: 1000,
        background: "#0f172acc", backdropFilter: "blur(16px)",
        borderRadius: "10px", padding: "8px 14px",
        border: "1px solid #1e293b", fontSize: "11px", color: "#475569"
      }}>
        Zoom: {zoom} • Click city for details
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
          background: #fff !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px #00000040 !important;
          padding: 8px 12px !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #fff !important;
        }
        .leaflet-control-attribution {
          background: #0f172a80 !important;
          color: #334155 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #475569 !important;
        }
      `}</style>
    </div>
  )
}