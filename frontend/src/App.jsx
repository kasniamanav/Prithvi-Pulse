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
    <div className="h-screen w-screen flex flex-col bg-[#030712] overflow-hidden text-slate-100 font-sans antialiased">

      {/* Animated background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#030712] to-[#030712] pointer-events-none opacity-80" />

      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-[9999] px-5 py-3 border rounded-xl text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-lg ${
            notification.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-200 shadow-red-500/10"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-emerald-500/10"
          }`}
          style={{ animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          {notification.type === "error" ? "❌" : "✅"} {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="relative z-[100]">
        <Header
          view={view}
          setView={setView}
          totalCities={dashboard.length}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative z-10">

        {/* Map view */}
        <div
          className={`absolute inset-0 flex transition-opacity duration-300 ease-in-out ${
            view === "map" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Map */}
          <div className="flex-1 h-full relative">
            <CityMap
              dashboard={dashboard}
              onCityClick={fetchCity}
              selectedCity={selectedCity}
            />
          </div>

          {/* Side panel */}
          <div className="w-[420px] h-full bg-[#0f172a]/60 backdrop-blur-md border-l border-slate-800/80 flex flex-col relative z-20 shadow-2xl overflow-y-auto">
            <CityPanel
              city={selectedCity}
              data={cityData}
              loading={loading}
              onSearch={fetchCity}
            />
          </div>
        </div>

        {/* Dashboard view */}
        <div
          className={`absolute inset-0 overflow-y-auto transition-opacity duration-300 ease-in-out ${
            view === "dashboard" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
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
        * { scrollbar-width: thin; scrollbar-color: #1e293b #030712; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>

    </div>
  )
}