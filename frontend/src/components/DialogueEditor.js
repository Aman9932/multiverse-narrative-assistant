import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function DialogueEditor({ onBack }) {
  const [dialogue, setDialogue] = useState("");
  const [emotion, setEmotion] = useState("Angry");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateDialogue = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult("");
    setMode("");
    setCopied(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/dialogue/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            dialogue,
            emotion
          })
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

      setResult(data.generated_dialogue);
      setMode(data.mode || "ai");

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyDialogue = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setError("Unable to copy dialogue.");
    }
  };
  const mobileStyles = `
    @media (max-width: 600px) {
      .dialogue-editor {
        width: calc(100% - 24px) !important;
        margin: 12px auto !important;
        padding: 16px !important;
        border-radius: 12px !important;
      }

      .dialogue-editor h1 {
        font-size: 25px;
      }

      .dialogue-editor h2 {
        font-size: 21px;
      }

      .dialogue-editor textarea,
      .dialogue-editor select {
        width: 100%;
        font-size: 16px;
      }

      .dialogue-editor button {
        min-height: 44px;
      }

      .dialogue-editor .generated-result {
        padding: 15px !important;
        overflow-wrap: anywhere;
      }

      .dialogue-editor .copy-button {
        width: 100%;
      }
    }
  `;

  return (
    <>
    <style>{mobileStyles}</style>

    <div className="dialogue-editor" style={styles.container}>

      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <h1>Dialogue Generator</h1>
      <p>Create emotional and expressive dialogues using AI.</p>

      <form onSubmit={generateDialogue}>
        <label>Original Dialogue</label>

        <textarea
          value={dialogue}
          onChange={(e) => setDialogue(e.target.value)}
          placeholder="Write your dialogue here..."
          required
          rows={5}
          style={styles.textarea}
        />

        <label>Select Emotion</label>

        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          style={styles.input}
        >
          <option>Angry</option>
          <option>Sad</option>
          <option>Romantic</option>
          <option>Fearful</option>
          <option>Confident</option>
          <option>Happy</option>
          <option>Mysterious</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Generating..." : "Generate Dialogue"}
        </button>
      </form>

      {error && <p style={styles.error}>Error: {error}</p>}

      {result && (
        <div className="generated-result" style={styles.result}>
          <h2>Generated Dialogue</h2>

          <p>
            Mode: {mode === "demo" ? "Demo Fallback" : "AI Generated"}
          </p>

          <ReactMarkdown>{result}</ReactMarkdown>

          <button
            className="copy-button"
            onClick={copyDialogue}
            style={styles.button}
          >
            {copied ? "Copied!" : "Copy Dialogue"}
          </button>
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
        maxWidth: "800px",
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
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    margin: "10px 0 20px",
    borderRadius: "8px"
  },
  button: {
    padding: "12px 22px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "15px"
  },
  result: {
    marginTop: "25px",
    padding: "20px",
    background: "#1e3a8a",
    borderRadius: "10px",
    lineHeight: "1.7"
  },
  error: {
    color: "#fca5a5",
    marginTop: "20px"
  }
};

export default DialogueEditor;