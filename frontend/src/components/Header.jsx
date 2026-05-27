export default function Header({ view, setView, totalCities, lastUpdated }) {
  return (
    <header style={{
      height: "60px",
      background: "linear-gradient(90deg, #0a0f1e 0%, #0f172a 50%, #0a0f1e 100%)",
      borderBottom: "1px solid #1e293b",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px", zIndex: 1000,
      boxShadow: "0 4px 32px #00000080"
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "38px", height: "38px",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          borderRadius: "10px",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "20px",
          boxShadow: "0 0 20px #22c55e50",
          animation: "glow 3s infinite"
        }}>
          🌍
        </div>
        <div>
          <h1 style={{
            fontSize: "18px", fontWeight: "800",
            color: "#fff", letterSpacing: "-0.5px",
            background: "linear-gradient(90deg, #fff, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Prithvi Pulse
          </h1>
          <p style={{
            fontSize: "9px", color: "#22c55e",
            letterSpacing: "3px", textTransform: "uppercase"
          }}>
            City Stress Index • India
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: "4px", background: "#0f172a", padding: "4px", borderRadius: "10px", border: "1px solid #1e293b" }}>
        {[
          { key: "map",       label: "🗺️ Map" },
          { key: "dashboard", label: "📊 Dashboard" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              padding: "7px 20px", borderRadius: "8px",
              border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "600",
              transition: "all 0.2s",
              background: view === key
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "transparent",
              color: view === key ? "#fff" : "#64748b",
              boxShadow: view === key ? "0 0 16px #22c55e40" : "none"
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {lastUpdated && (
          <span style={{ fontSize: "11px", color: "#334155" }}>
            Updated {lastUpdated.toLocaleTimeString("en-IN")}
          </span>
        )}
        <div style={{
          background: "#0f172a", borderRadius: "8px",
          padding: "6px 14px", border: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: "6px"
        }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>🏙️</span>
          <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "700" }}>
            {totalCities}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>cities</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "8px", height: "8px",
            background: "#22c55e", borderRadius: "50%",
            animation: "pulse 2s infinite"
          }} />
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live</span>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px #22c55e50; }
          50%       { box-shadow: 0 0 32px #22c55e80; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
          50%       { opacity: 0.4; box-shadow: 0 0 12px #22c55e; }
        }
      `}</style>
    </header>
  )
}