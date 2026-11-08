import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";

function Editor({ onBack }) {
  const [form, setForm] = useState({
    name: "",
    age: 25,
    personality: "",
    powers: "",
    universe: ""
  });

  const [result, setResult] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const generateCharacter = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult("");
    setMode("");
    setStatus("Connecting to Gemini AI...");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/character/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...form,
            age: Number(form.age)
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

      setResult(data.generated_biography);
      setMode(data.mode || "ai");

      setStatus(
        data.mode === "demo"
          ? "Gemini unavailable. Demo result loaded."
          : "Character generated successfully!"
      );

    } catch (err) {
      setError(err.message || "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  // Copy biography
  const copyBiography = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setStatus("Biography copied successfully!");
    } catch {
      setError("Unable to copy biography.");
    }
  };

  // Download TXT
  const downloadTXT = () => {
    const blob = new Blob([result], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${form.name || "character"}-biography.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Download PDF
  const downloadPDF = () => {
    const pdf = new jsPDF();

    const lines = pdf.splitTextToSize(result, 180);

    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    let y = 15;

    lines.forEach((line) => {
      if (y > 280) {
        pdf.addPage();
        y = 15;
      }

      pdf.text(line, 15, y);
      y += 7;
    });

    pdf.save(`${form.name || "character"}-biography.pdf`);
  };
  const mobileStyles = `
  @media (max-width: 600px) {
    .character-editor {
      margin: 12px !important;
      padding: 16px !important;
      border-radius: 12px !important;
    }

    .character-editor h1 {
      font-size: 25px;
    }

    .character-editor h2 {
      font-size: 21px;
    }

    .character-editor input {
      font-size: 16px;
    }

    .character-editor .export-buttons {
      display: grid !important;
      grid-template-columns: 1fr !important;
    }

    .character-editor .export-buttons button {
      width: 100%;
      min-height: 44px;
    }

    .character-editor .generated-result {
      padding: 15px !important;
      overflow-wrap: anywhere;
    }
  }`;

  return (
    <>
    <style>{mobileStyles}</style>

    <div
      className="character-editor"
      style={{
        width: "calc(100% - 24px)",
        maxWidth: "800px",
        margin: "30px auto",
        padding: "25px",
        color: "white",
        background: "#172554",
        borderRadius: "15px",
        boxSizing: "border-box"
      }}
    >
    
    <button
        onClick={onBack}
        style={{
            padding: "10px 18px",
            background: "#475569",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "15px"
        }}
        >
        ← Back to Dashboard
        </button>

      <h1>Character Generator</h1>
      <p>Create your own fictional character using AI.</p>

      <form onSubmit={generateCharacter}>
        {[
          ["name", "Character Name"],
          ["age", "Age"],
          ["personality", "Personality"],
          ["powers", "Special Powers"],
          ["universe", "Universe"]
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label>{label}</label>

            <input
              type={key === "age" ? "number" : "text"}
              name={key}
              value={form[key]}
              onChange={handleChange}
              required
              min={key === "age" ? 1 : undefined}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                borderRadius: "8px",
                border: "1px solid #64748b",
                boxSizing: "border-box"
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 25px",
            background: loading ? "#64748b" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate Character"}
        </button>
      </form>

      {loading && (
        <p style={{ color: "#93c5fd", marginTop: "15px" }}>
          ⏳ {status}
        </p>
      )}

      {error && (
        <p style={{ color: "#fca5a5", marginTop: "20px" }}>
          Error: {error}
        </p>
      )}

      {!loading && status && !error && (
        <p style={{ color: "#86efac", marginTop: "15px" }}>
          {status}
        </p>
      )}

      {result && (
        <div style={{
          marginTop: "25px",
          padding: "20px",
          background: "#1e3a8a",
          borderRadius: "10px",
          lineHeight: "1.7"
        }}>

          <h2>Generated Character</h2>

          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "20px",
            background: mode === "demo" ? "#854d0e" : "#166534",
            color: "white",
            fontSize: "13px",
            marginBottom: "15px"
          }}>
            {mode === "demo" ? "DEMO MODE" : "AI GENERATED"}
          </div>

          <div className="generated-result">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>

          <hr style={{ margin: "20px 0", opacity: 0.3 }} />

          <h3>Export Biography</h3>

          <div className="export-buttons" style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}>

            <button type="button" onClick={copyBiography}>
              Copy Biography
            </button>

            <button type="button" onClick={downloadTXT}>
              Download TXT
            </button>

            <button type="button" onClick={downloadPDF}>
              Download PDF
            </button>

          </div>

        </div>
      )}
    </div>
    </>
  );
}

export default Editor;