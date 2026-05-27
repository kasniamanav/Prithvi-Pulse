import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import CityMap from "./components/CityMap"
import CityPanel from "./components/CityPanel"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"

const API = "https://prithvi-pulse.onrender.com"

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityData,     setCityData]     = useState(null)
  const [dashboard,    setDashboard]    = useState([])
  const [loading,      setLoading]      = useState(false)
  const [view,         setView]         = useState("map")
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000)
    return () => clearInterval(interval)
  }, [])

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/dashboard`)
      const cities = res.data.cities || []
      setDashboard(cities)
      setLastUpdated(new Date())
    } catch (e) {
      showNotification("Failed to fetch dashboard", "error")
    }
  }

  const fetchCity = useCallback(async (cityName) => {
    if (!cityName) return
    setLoading(true)
    setCityData(null)
    setSelectedCity(cityName)

    try {
      const res = await axios.get(`${API}/api/city/${cityName}`)
      const data = res.data

      if (data.error) {
        showNotification(`City "${cityName}" not found`, "error")
        setLoading(false)
        return
      }

      setCityData(data)

      // sync dashboard with live value
      setDashboard(prev => {
        const exists = prev.find(
          c => c.city.toLowerCase() === cityName.toLowerCase()
        )
        if (exists) {
          return prev.map(c =>
            c.city.toLowerCase() === cityName.toLowerCase()
              ? {
                  ...c,
                  csi:       data.csi,
                  level:     data.level,
                  timestamp: new Date().toISOString()
                }
              : c
          )
        }
        return [
          ...prev,
          {
            city:      cityName,
            csi:       data.csi,
            level:     data.level,
            timestamp: new Date().toISOString()
          }
        ]
      })

      showNotification(`${data.city} — CSI: ${data.csi} (${data.level})`)

    } catch (e) {
      showNotification("Failed to fetch city data", "error")
    }

    setLoading(false)
  }, [])

  return (
    <div style={{
      height: "100vh", width: "100vw",
      display: "flex", flexDirection: "column",
      background: "#030712", overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* Animated background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 20% 50%, #0f172a 0%, #030712 60%)",
        pointerEvents: "none"
      }} />

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: "fixed", top: "80px", right: "24px",
          zIndex: 9999, padding: "12px 20px",
          background: notification.type === "error" ? "#ef444420" : "#22c55e20",
          border: `1px solid ${notification.type === "error" ? "#ef4444" : "#22c55e"}`,
          borderRadius: "12px", color: "#fff", fontSize: "13px",
          backdropFilter: "blur(10px)",
          animation: "slideIn 0.3s ease",
          boxShadow: notification.type === "error"
            ? "0 0 20px #ef444440"
            : "0 0 20px #22c55e40"
        }}>
          {notification.type === "error" ? "❌" : "✅"} {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <Header
          view={view}
          setView={setView}
          totalCities={dashboard.length}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* Map view */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex",
          opacity: view === "map" ? 1 : 0,
          pointerEvents: view === "map" ? "all" : "none",
          transition: "opacity 0.3s ease"
        }}>
          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            <CityMap
              dashboard={dashboard}
              onCityClick={fetchCity}
              selectedCity={selectedCity}
            />
          </div>

          {/* Side panel */}
          <div style={{
            width: "400px",
            background: "linear-gradient(180deg, #0f172a 0%, #030712 100%)",
            overflowY: "auto",
            borderLeft: "1px solid #1e293b",
            position: "relative", zIndex: 10
          }}>
            <CityPanel
              city={selectedCity}
              data={cityData}
              loading={loading}
              onSearch={fetchCity}
            />
          </div>
        </div>

        {/* Dashboard view */}
        <div style={{
          position: "absolute", inset: 0,
          overflowY: "auto",
          opacity: view === "dashboard" ? 1 : 0,
          pointerEvents: view === "dashboard" ? "all" : "none",
          transition: "opacity 0.3s ease"
        }}>
          <Dashboard
            dashboard={dashboard}
            onCityClick={(city) => {
              fetchCity(city)
              setView("map")
            }}
            lastUpdated={lastUpdated}
          />
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #22c55e; }
          50%       { opacity: 0.5; box-shadow: 0 0 16px #22c55e; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { scrollbar-width: thin; scrollbar-color: #1e293b #030712; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>

    </div>
  )
}