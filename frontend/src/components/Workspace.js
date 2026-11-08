import React, { useCallback, useEffect, useState } from "react";

const API_URL = `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api`;

function Workspace({
  token,
  onBack,
  onOpenCharacter,
  onOpenDialogue,
  onOpenPlot
}) {
  const [universes, setUniverses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
  "Authorization": `Bearer ${token}`
};

const [universeResponse, eventResponse] = await Promise.all([
  fetch(`${API_URL}/universes`, { headers }),
  fetch(`${API_URL}/timeline/events`, { headers })
]);

      if (!universeResponse.ok || !eventResponse.ok) {
        throw new Error("Unable to load workspace data.");
      }

      const universeData = await universeResponse.json();
      const eventData = await eventResponse.json();

      setUniverses(universeData.universes || []);
      setEvents(eventData.events || []);

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const sortedEvents = [...events].sort((a, b) =>
    String(b.event_time || "").localeCompare(
      String(a.event_time || "")
    )
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not specified";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString();
  };

  const tools = [
    {
      icon: "🦸",
      title: "Character Generator",
      description: "Create unique characters and detailed backstories.",
      action: onOpenCharacter,
      color: "#8b5cf6"
    },
    {
      icon: "💬",
      title: "Dialogue Generator",
      description: "Generate emotional and expressive conversations.",
      action: onOpenDialogue,
      color: "#06b6d4"
    },
    {
      icon: "📖",
      title: "Plot Generator",
      description: "Explore alternate endings and branching stories.",
      action: onOpenPlot,
      color: "#f59e0b"
    }
  ];

  return (
    <div className="workspace">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .workspace {
          min-height: 100vh;
          padding: 30px;
          background:
            radial-gradient(ellipse at top left, #172554, transparent 45%),
            #070b18;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }

        .workspace-inner {
          max-width: 1400px;
          margin: auto;
        }

        .workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .back-btn, .refresh-btn {
          padding: 11px 18px;
          border: 1px solid #475569;
          border-radius: 9px;
          color: white;
          background: #1e293b;
          cursor: pointer;
        }

        .refresh-btn {
          background: #1d4ed8;
          border-color: #3b82f6;
        }

        .workspace-title {
          margin-top: 30px;
          font-size: clamp(27px, 4vw, 36px);
        }

        .muted {
          color: #94a3b8;
          line-height: 1.7;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin: 30px 0 40px;
        }

        .stat-card {
          padding: 25px;
          border: 1px solid #334155;
          border-radius: 16px;
          background: linear-gradient(135deg, #172554, #1e1b4b);
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #93c5fd;
        }

        .section-title {
          margin: 38px 0 20px;
          font-size: 23px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }

        .quick-card {
          padding: 23px;
          border-radius: 15px;
          border: 1px solid #334155;
          background: #111c35;
          cursor: pointer;
          transition: 0.2s;
        }

        .quick-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
        }

        .quick-icon {
          font-size: 32px;
        }

        .quick-card p {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 13px;
        }

        .open-label {
          color: #bfdbfe;
          font-size: 13px;
          font-weight: bold;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .data-card {
          padding: 23px;
          border-radius: 15px;
          border: 1px solid #334155;
          background: linear-gradient(145deg, #172554, #1e1b4b);
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .data-card h3 {
          color: #bfdbfe;
        }

        .timeline-list {
          border-left: 2px solid #3b82f6;
          margin-left: 10px;
          padding-left: 22px;
          display: grid;
          gap: 18px;
        }

        .timeline-card {
          position: relative;
          padding: 22px;
          background: #111c35;
          border: 1px solid #334155;
          border-radius: 14px;
        }

        .timeline-card::before {
          content: "";
          position: absolute;
          left: -31px;
          top: 25px;
          width: 14px;
          height: 14px;
          background: #60a5fa;
          border: 3px solid #070b18;
          border-radius: 50%;
        }

        .event-date {
          color: #93c5fd;
          font-size: 13px;
        }

        .empty-state {
          padding: 25px;
          background: #111827;
          border-radius: 12px;
          color: #94a3b8;
        }

        .error-state {
          padding: 18px;
          margin-top: 20px;
          background: #451a1a;
          color: #fecaca;
          border-radius: 10px;
        }

        .workspace-footer {
          margin-top: 55px;
          padding: 22px;
          border-top: 1px solid #293449;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .workspace {
            padding: 20px 14px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .workspace-header {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="workspace-inner">

        <header className="workspace-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <button
            className="refresh-btn"
            onClick={loadWorkspace}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh Workspace"}
          </button>
        </header>

        <h1 className="workspace-title">
          ✨ AI Creative Workspace
        </h1>

        <p className="muted">
          Your central hub for characters, stories, timelines and universes.
        </p>

        {error && (
          <div className="error-state">
            <strong>Workspace Error:</strong> {error}
            <p>
              Check whether your backend server is running, then refresh.
            </p>
          </div>
        )}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-number">
              {loading ? "..." : universes.length}
            </div>
            <p className="muted">🌌 Saved Universes</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {loading ? "..." : events.length}
            </div>
            <p className="muted">⏳ Timeline Events</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">03</div>
            <p className="muted">🤖 AI Story Generators</p>
          </div>

        </section>

        <h2 className="section-title">
          ⚡ Quick Actions
        </h2>

        <section className="quick-grid">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="quick-card"
              style={{ "--accent": tool.color }}
              onClick={tool.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tool.action?.();
                }
              }}
            >
              <div className="quick-icon">{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span className="open-label">Open Tool →</span>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="empty-state" style={{ marginTop: 35 }}>
            Loading your workspace data...
          </div>
        ) : (
          <>

            <h2 className="section-title">
              🌌 Your Universes
            </h2>

            {universes.length === 0 ? (
              <div className="empty-state">
                No universes created yet. Create your first universe
                using Multiverse Builder.
              </div>
            ) : (
              <section className="data-grid">
                {universes.map((universe) => (
                  <div className="data-card" key={universe.id}>
                    <h3>🌌 {universe.name}</h3>

                    <p>{universe.description}</p>

                    <p>
                      <strong>Genre:</strong>{" "}
                      {universe.genre || "Not specified"}
                    </p>

                    <p>
                      <strong>Power System:</strong>{" "}
                      {universe.power_system || "Not specified"}
                    </p>
                  </div>
                ))}
              </section>
            )}

            <h2 className="section-title">
              ⏳ Story Timeline
            </h2>

            {events.length === 0 ? (
              <div className="empty-state">
                No timeline events available yet.
              </div>
            ) : (
              <section className="timeline-list">
                {sortedEvents.slice(0, 10).map((event) => (
                  <article className="timeline-card" key={event.id}>
                    <h3>{event.title}</h3>

                    <p className="muted">
                      {event.description}
                    </p>

                    <p className="event-date">
                      🕒 {formatDate(event.event_time)}
                    </p>

                    <p>
                      <strong>Character:</strong>{" "}
                      {event.character_name || "Not specified"}
                    </p>

                    <p>
                      <strong>Universe:</strong>{" "}
                      {event.universe || "Not specified"}
                    </p>
                  </article>
                ))}
              </section>
            )}

          </>
        )}

        <footer className="workspace-footer">
          🌌 Multiverse Narrative Assistant
          <br />
          AI-Powered Creative Workspace
        </footer>

      </div>
    </div>
  );
}

export default Workspace;