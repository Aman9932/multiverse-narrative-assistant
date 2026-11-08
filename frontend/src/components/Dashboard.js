import React, { useState } from "react";
import Editor from "./Editor";
import DialogueEditor from "./DialogueEditor";
import PlotEditor from "./PlotEditor";
import TimelineManager from "./TimelineManager";
import UniverseBuilder from "./UniverseBuilder";
import Workspace from "./Workspace";
import CharacterLibrary from "./CharacterLibrary";

function Dashboard() {
  const [showEditor, setShowEditor] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showPlotEditor, setShowPlotEditor] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showUniverse, setShowUniverse] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState(false);

  if (showEditor)
    return <Editor onBack={() => setShowEditor(false)} />;

  if (showDialogue)
    return <DialogueEditor onBack={() => setShowDialogue(false)} />;

  if (showPlotEditor)
    return <PlotEditor onBack={() => setShowPlotEditor(false)} />;

  if (showTimeline)
    return <TimelineManager onBack={() => setShowTimeline(false)} />;

  if (showUniverse)
    return <UniverseBuilder onBack={() => setShowUniverse(false)} />;

  if (showWorkspace) {
    return (
        <Workspace
        onBack={() => setShowWorkspace(false)}
        onOpenCharacter={() => setShowEditor(true)}
        onOpenDialogue={() => setShowDialogue(true)}
        onOpenPlot={() => setShowPlotEditor(true)}
        />
    );
    }
    if (showCharacterLibrary) {
        return (
            <CharacterLibrary
            onBack={() => setShowCharacterLibrary(false)}
            />
        );
    }

  const features = [
    {
      icon: "🦸",
      title: "Character Generator",
      description: "Create powerful fictional characters with unique personalities, abilities and backstories.",
      tag: "AI GENERATION",
      action: () => setShowEditor(true),
      color: "#8b5cf6"
    },
    {
      icon: "💬",
      title: "Dialogue Generator",
      description: "Transform ordinary conversations into emotional and expressive dialogues.",
      tag: "AI GENERATION",
      action: () => setShowDialogue(true),
      color: "#06b6d4"
    },
    {
      icon: "📖",
      title: "Plot Generator",
      description: "Explore alternate realities through multiple endings and branching storylines.",
      tag: "AI GENERATION",
      action: () => setShowPlotEditor(true),
      color: "#f59e0b"
    },
    {
      icon: "⏳",
      title: "Timeline Manager",
      description: "Organize story events, characters and important moments across time.",
      tag: "STORY MANAGEMENT",
      action: () => setShowTimeline(true),
      color: "#10b981"
    },
    {
      icon: "🌌",
      title: "Multiverse Builder",
      description: "Create and manage interconnected fictional universes and their power systems.",
      tag: "WORLD BUILDING",
      action: () => setShowUniverse(true),
      color: "#ec4899"
    },
    {
        icon: "📚",
        title: "Character Library",
        description: "Explore and read all your saved AI-generated characters.",
        tag: "CHARACTER MANAGEMENT",
        action: () => setShowCharacterLibrary(true),
        color: "#f97316"
    },
  ];

  return (
    <div className="dashboard">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          padding: 35px;
          background:
            radial-gradient(ellipse at top left, #172554 0%, transparent 45%),
            radial-gradient(ellipse at bottom right, #312e81 0%, transparent 40%),
            #070b18;
          color: #f8fafc;
          font-family: Arial, sans-serif;
        }

        .topbar {
          max-width: 1400px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 19px;
          font-weight: bold;
        }

        .brand-icon {
          font-size: 30px;
        }

        .workspace-badge {
          background: #1e1b4b;
          color: #c4b5fd;
          border: 1px solid #4c1d95;
          border-radius: 30px;
          padding: 11px 18px;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .hero {
          max-width: 1400px;
          margin: 45px auto 35px;
          padding: 55px 45px;
          border-radius: 24px;
          background: linear-gradient(120deg, #312e81, #1d4ed8, #164e63);
          border: 1px solid #6366f1;
          box-shadow: 0 20px 60px rgba(37, 99, 235, 0.18);
          position: relative;
          overflow: hidden;
        }

        .hero::after {
          content: "✦";
          position: absolute;
          right: 65px;
          top: 15px;
          font-size: 150px;
          color: rgba(255,255,255,0.08);
        }

        .hero-label {
          color: #bfdbfe;
          font-size: 12px;
          letter-spacing: 4px;
          font-weight: bold;
        }

        .hero h1 {
          font-size: clamp(30px, 5vw, 48px);
          margin: 18px 0;
          max-width: 750px;
        }

        .hero p {
          color: #dbeafe;
          line-height: 1.8;
          max-width: 650px;
        }

        .stats {
          max-width: 1400px;
          margin: 30px auto 45px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .stat-card {
          padding: 23px;
          background: rgba(30, 41, 59, 0.75);
          border: 1px solid #334155;
          border-radius: 15px;
        }

        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #93c5fd;
        }

        .stat-label {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 13px;
        }

        .section-heading {
          max-width: 1400px;
          margin: 0 auto 22px;
          font-size: 24px;
        }

        .section-description {
          max-width: 1400px;
          margin: -12px auto 25px;
          color: #94a3b8;
          font-size: 14px;
        }

        .tools-grid {
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .tool-card {
          position: relative;
          padding: 25px;
          min-height: 250px;
          background: linear-gradient(145deg, #172554, #111827);
          border: 1px solid #334155;
          border-radius: 18px;
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
        }

        .tool-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.15);
        }

        .tool-icon {
          font-size: 38px;
          margin-bottom: 20px;
        }

        .tool-tag {
          color: var(--accent);
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1.5px;
        }

        .tool-card h3 {
          font-size: 18px;
          margin: 12px 0;
        }

        .tool-description {
          color: #a5b4c8;
          font-size: 13px;
          line-height: 1.7;
          min-height: 65px;
        }

        .open-tool {
          color: #bfdbfe;
          font-size: 13px;
          margin-top: 15px;
          font-weight: bold;
        }

        .footer {
          max-width: 1400px;
          margin: 60px auto 0;
          padding: 25px 0;
          border-top: 1px solid #293449;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .dashboard {
            padding: 20px 15px;
          }

          .hero {
            padding: 35px 23px;
            margin-top: 30px;
          }

          .hero::after {
            right: 10px;
            font-size: 90px;
          }

          .stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .tool-card {
            min-height: 220px;
          }
        }
        /* Tablet Responsive */
        @media (max-width: 768px) {
          .dashboard {
            padding: 20px;
          }

          .hero {
            padding: 35px 25px;
            margin-top: 25px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .tools-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Small Mobile Responsive */
        @media (max-width: 480px) {
          .dashboard {
            padding: 12px;
          }

          .topbar {
            align-items: flex-start;
          }

          .brand {
            font-size: 16px;
          }

          .workspace-badge {
            padding: 9px 12px;
            font-size: 10px;
          }

          .hero {
            padding: 28px 18px;
            border-radius: 16px;
          }

          .hero h1 {
            font-size: 29px;
          }

          .hero p {
            font-size: 14px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .tools-grid {
            grid-template-columns: 1fr;
          }

          .tool-card {
            min-height: auto;
            padding: 20px;
          }

          .section-heading {
            font-size: 21px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">🌌</span>
          <span>Multiverse Assistant</span>
        </div>

        <button
        className="workspace-badge"
        onClick={() => setShowWorkspace(true)}
        style={{ cursor: "pointer" }}
        >
        ✦ AI WORKSPACE →
        </button>
      </header>

      <section className="hero">
        <div className="hero-label">UNLIMITED IMAGINATION</div>

        <h1>
          Welcome to the Multiverse
        </h1>

        <p>
          Every universe has a story. Create extraordinary characters,
          generate emotional dialogues, explore alternate timelines
          and build your own fictional worlds with AI.
        </p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-number">05</div>
          <div className="stat-label">Creative Tools</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">03</div>
          <div className="stat-label">AI Story Generators</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">02</div>
          <div className="stat-label">World Management Tools</div>
        </div>
      </section>

      <h2 className="section-heading">
        Explore Creative Tools
      </h2>

      <p className="section-description">
        Choose a tool and bring your imagination to life.
      </p>

      <section className="tools-grid">
        {features.map((feature) => (
          <div
            className="tool-card"
            key={feature.title}
            style={{ "--accent": feature.color }}
            onClick={feature.action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                feature.action();
              }
            }}
          >
            <div className="tool-icon">
              {feature.icon}
            </div>

            <div className="tool-tag">
              {feature.tag}
            </div>

            <h3>{feature.title}</h3>

            <p className="tool-description">
              {feature.description}
            </p>

            <div className="open-tool">
              Open Tool →
            </div>
          </div>
        ))}
      </section>

      <footer className="footer">
        🌌 Multiverse Narrative Assistant
        <br />
        AI-Powered Storytelling Platform · Built for Creative Minds
      </footer>

    </div>
  );
}

export default Dashboard;