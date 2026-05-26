export default function Header({ view, setView }) {
  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
          🌍
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Prithvi Pulse</h1>
          <p className="text-xs text-slate-400">City Stress Index — India</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex gap-2">
        <button
          onClick={() => setView("map")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            view === "map"
              ? "bg-green-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          🗺️ Map
        </button>
        <button
          onClick={() => setView("dashboard")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            view === "dashboard"
              ? "bg-green-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          📊 Dashboard
        </button>
      </nav>

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-slate-400">Live data</span>
      </div>
    </header>
  )
}