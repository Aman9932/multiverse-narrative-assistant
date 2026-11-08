import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function PlotEditor({ onBack }) {
  const mobileStyles = `
    @media (max-width: 600px) {
      .plot-editor {
        width: calc(100% - 24px) !important;
        margin: 12px auto !important;
        padding: 16px !important;
        border-radius: 12px !important;
      }

      .plot-editor h1 {
        font-size: 25px;
      }

      .plot-editor h2 {
        font-size: 21px;
      }

      .plot-editor textarea {
        width: 100%;
        font-size: 16px;
      }

      .plot-editor button {
        min-height: 44px;
      }

      .plot-editor .generated-result {
        padding: 15px !important;
        overflow-wrap: anywhere;
      }

      .plot-editor .export-buttons {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 10px;
      }

      .plot-editor .export-buttons button {
        width: 100%;
        margin: 0 !important;
      }
    }
  `;
  const [story, setStory] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePlot = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult("");
    setMode("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/plot/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ story })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
      }

      setResult(data.generated_endings);
      setMode(data.mode || "ai");

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyPlot = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError("Unable to copy plot.");
    }
  };

  const downloadPlot = () => {
    const blob = new Blob([result], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "story-endings.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
    <style>{mobileStyles}</style>

    <div className="plot-editor" style={styles.container}>

      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <h1>Branching Plot Generator</h1>

      <p>
        Generate multiple possible endings for your story using AI.
      </p>

      <form onSubmit={generatePlot}>
        <label>Enter Your Story</label>

        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Write your story here..."
          required
          rows={7}
          style={styles.textarea}
        />

        <button
          type="submit"
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Generating Endings..." : "Generate 3 Endings"}
        </button>
      </form>

      {error && (
        <p style={styles.error}>Error: {error}</p>
      )}

      {result && (
        <div className="generated-result" style={styles.result}>
          <h2>Generated Story Endings</h2>

          <p>
            Mode: {mode === "demo" ? "Demo Fallback" : "AI Generated"}
          </p>

          <ReactMarkdown>{result}</ReactMarkdown>

          <div className="export-buttons">
            <button onClick={copyPlot} style={styles.button}>
              Copy All Endings
            </button>

            <button onClick={downloadPlot} style={styles.button}>
              Download TXT
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

const styles = {
    backButton: {
        padding: "10px 18px",
        background: "#312e81",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "20px"
    },
  container: {
    maxWidth: "850px",
    margin: "30px auto",
    padding: "25px",
    color: "white",
    background: "#172554",
    borderRadius: "15px",
    fontFamily: "Arial, sans-serif"
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    margin: "10px 0 20px",
    borderRadius: "8px",
    fontSize: "15px"
  },
  button: {
    padding: "12px 20px",
    margin: "10px 10px 0 0",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  result: {
    marginTop: "25px",
    padding: "20px",
    background: "#1e3a8a",
    borderRadius: "10px",
    lineHeight: "1.8"
  },
  error: {
    color: "#fca5a5",
    marginTop: "20px"
  }
};

export default PlotEditor;