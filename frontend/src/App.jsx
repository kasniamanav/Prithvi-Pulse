import { useState, useEffect } from "react"
import axios from "axios"
import CityMap from "./components/CityMap"
import CityPanel from "./components/CityPanel"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"

const API = "http://127.0.0.1:8000"

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityData,     setCityData]     = useState(null)
  const [dashboard,    setDashboard]    = useState([])
  const [loading,      setLoading]      = useState(false)
  const [view,         setView]         = useState("map")

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/dashboard`)
      setDashboard(res.data.cities || [])
    } catch (e) {
      console.error("Dashboard fetch failed:", e)
    }
  }

  const fetchCity = async (cityName) => {
    setLoading(true)
    setCityData(null)
    try {
      const res = await axios.get(`${API}/api/city/${cityName}`)
      setCityData(res.data)
      setSelectedCity(cityName)
    } catch (e) {
      console.error("City fetch failed:", e)
    }
    setLoading(false)
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      
      <Header view={view} setView={setView} />

      {view === "map" ? (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* Map takes most space */}
          <div style={{ flex: 1, position: "relative" }}>
            <CityMap
              dashboard={dashboard}
              onCityClick={fetchCity}
              selectedCity={selectedCity}
            />
          </div>

          {/* Side panel */}
          <div style={{ width: "380px", background: "#1e293b", overflowY: "auto", borderLeft: "1px solid #334155" }}>
            <CityPanel
              city={selectedCity}
              data={cityData}
              loading={loading}
              onSearch={fetchCity}
            />
          </div>

        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Dashboard
            dashboard={dashboard}
            onCityClick={fetchCity}
          />
        </div>
      )}

    </div>
  )
}