// src/components/Dashboard.jsx

function getColor(csi) {
  if (csi >= 80) return "bg-red-500"
  if (csi >= 60) return "bg-orange-500"
  if (csi >= 40) return "bg-yellow-500"
  if (csi >= 20) return "bg-green-500"
  return "bg-blue-500"
}

function getTextColor(csi) {
  if (csi >= 80) return "text-red-400"
  if (csi >= 60) return "text-orange-400"
  if (csi >= 40) return "text-yellow-400"
  if (csi >= 20) return "text-green-400"
  return "text-blue-400"
}

export default function Dashboard({ dashboard, onCityClick }) {
  const sorted = [...dashboard].sort((a, b) => b.csi - a.csi)

  if (!dashboard.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">City Stress Dashboard</h2>
      <p className="text-slate-400 text-sm mb-6">
        Live CSI scores for Indian cities — updated every hour
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Total Cities</p>
          <p className="text-2xl font-bold text-white">{dashboard.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Most Stressed</p>
          <p className="text-lg font-bold text-red-400 capitalize">
            {sorted[0]?.city}
          </p>
          <p className="text-xs text-red-300">{sorted[0]?.csi} CSI</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Least Stressed</p>
          <p className="text-lg font-bold text-green-400 capitalize">
            {sorted[sorted.length - 1]?.city}
          </p>
          <p className="text-xs text-green-300">
            {sorted[sorted.length - 1]?.csi} CSI
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Average CSI</p>
          <p className="text-2xl font-bold text-yellow-400">
            {(dashboard.reduce((a, b) => a + b.csi, 0) / dashboard.length).toFixed(1)}
          </p>
        </div>
      </div>

      {/* City cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((city, index) => (
          <div
            key={city.city}
            onClick={() => onCityClick(city.city.toLowerCase())}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 cursor-pointer hover:border-green-500 transition-all hover:scale-105"
          >
            {/* City header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm font-bold">
                  #{index + 1}
                </span>
                <h3 className="font-bold capitalize text-white">
                  {city.city}
                </h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getColor(city.csi)}`}>
                {city.level}
              </span>
            </div>

            {/* CSI bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">CSI Score</span>
                <span className={`font-bold ${getTextColor(city.csi)}`}>
                  {city.csi}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getColor(city.csi)}`}
                  style={{ width: `${city.csi}%` }}
                />
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-slate-500">
              🕐 {new Date(city.timestamp).toLocaleTimeString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}