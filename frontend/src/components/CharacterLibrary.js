import React, { useEffect, useState } from "react";

const API_URL = "https://multiverse-narrative-backend.onrender.com/api/characters";

function CharacterLibrary({ onBack }) {
  const mobileStyles = `
    @media (max-width: 600px) {
      .character-library {
        padding: 16px !important;
      }

      .character-library h1 {
        font-size: 25px;
      }

      .character-library h2 {
        font-size: 21px;
      }

      .character-library input,
      .character-library select,
      .character-library textarea {
        width: 100%;
        max-width: 100%;
        font-size: 16px;
        box-sizing: border-box;
      }

      .character-library button {
        min-height: 44px;
      }

      .character-library .search-controls {
        display: grid !important;
        grid-template-columns: 1fr;
        gap: 10px !important;
      }

      .character-library .edit-form {
        padding: 16px !important;
      }

      .character-library .character-grid {
        grid-template-columns: 1fr !important;
        gap: 14px;
      }

      .character-library .character-card {
        padding: 16px !important;
        overflow-wrap: anywhere;
      }

      .character-library .character-actions {
        display: grid !important;
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .character-library .character-actions button {
        width: 100%;
        margin: 0 !important;
      }

      .character-library pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
    }
  `;
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniverse, setSelectedUniverse] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    personality: "",
    powers: "",
    universe: ""
  });

  const loadCharacters = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load characters");
      }

      setCharacters(data.characters || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (character) => {
    setEditingId(character.id);

    setEditForm({
      name: character.name || "",
      age: character.age ?? "",
      personality: character.personality || "",
      powers: character.powers || "",
      universe: character.universe || ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editForm,
          age: Number(editForm.age)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update character");
      }

      setEditingId(null);
      await loadCharacters();

      alert("Character updated successfully!");

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.detail || "Unable to delete character");
        }

        await loadCharacters();

        alert("Character deleted successfully!");

    } catch (err) {
        setError(err.message);
    }
  };


  useEffect(() => {
    loadCharacters();
  }, []);

  const universes = [
  "All",
  ...new Set(characters.map((character) => character.universe).filter(Boolean))
];

const filteredCharacters = characters.filter((character) => {
  const matchesName = character.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesUniverse =
    selectedUniverse === "All" ||
    character.universe === selectedUniverse;

  return matchesName && matchesUniverse;
});

  return (
    <>
      <style>{mobileStyles}</style>

      <div className="character-library" style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <h1>🦸 Character Library</h1>
      <p style={styles.subtitle}>
        Explore all your AI-generated and saved characters.
      </p>

      <div style={styles.stats}>
        <h2>{characters.length}</h2>
        <p>Saved Characters</p>
      </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "20px 0" }}>
        <input
            type="text"
            placeholder="Search character by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", minWidth: "230px" }}
        />

        <select
            value={selectedUniverse}
            onChange={(e) => setSelectedUniverse(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px" }}
        >
            {universes.map((universe) => (
            <option key={universe} value={universe}>
                {universe === "All" ? "All Universes" : universe}
            </option>
            ))}
        </select>
        </div>

      <button onClick={loadCharacters} style={styles.refreshButton}>
        ↻ Refresh Characters
      </button>

      {loading && <p>Loading characters...</p>}

      {error && <p style={styles.error}>Error: {error}</p>}

      {!loading && !error && characters.length === 0 && (
        <p>No saved characters yet. Generate your first character!</p>
      )}

      {editingId !== null && (
      <form
      className="edit-form"
        onSubmit={handleUpdate}
        style={{
          maxWidth: "700px",
          margin: "25px 0",
          padding: "25px",
          background: "#172554",
          borderRadius: "15px"
        }}
      >
        <h2>✏️ Edit Character</h2>

        <label>Character Name</label>
        <input
          name="name"
          value={editForm.name}
          onChange={handleEditChange}
          required
          style={styles.input}
        />

        <label>Age</label>
        <input
          type="number"
          name="age"
          value={editForm.age}
          onChange={handleEditChange}
          required
          min="1"
          style={styles.input}
        />

        <label>Personality</label>
        <textarea
          name="personality"
          value={editForm.personality}
          onChange={handleEditChange}
          style={styles.input}
        />

        <label>Special Powers</label>
        <textarea
          name="powers"
          value={editForm.powers}
          onChange={handleEditChange}
          style={styles.input}
        />

        <label>Universe</label>
        <input
          name="universe"
          value={editForm.universe}
          onChange={handleEditChange}
          style={styles.input}
        />

        <button type="submit" style={styles.saveButton}>
          💾 Save Changes
        </button>

        <button
          type="button"
          onClick={() => setEditingId(null)}
          style={styles.cancelButton}
        >
          Cancel
        </button>
      </form>
    )}

      <div className="character-grid" style={styles.grid}>
        {filteredCharacters.map((character) => (
          <div key={character.id}
          className="character-card"
          style={styles.card}>
            <h2>🦸 {character.name}</h2>

            <p><strong>Age:</strong> {character.age ?? "Not specified"}</p>

            <p><strong>Universe:</strong> {character.universe || "Unknown"}</p>

            <p><strong>Personality:</strong> {character.personality || "Not specified"}</p>

            <p><strong>Special Powers:</strong> {character.powers || "Not specified"}</p>

            <details>
              <summary>Read Full Biography</summary>
              <pre style={styles.biography}>
                {character.biography}
              </pre>
            </details>
            <button
              onClick={() => handleEdit(character)}
              style={styles.editButton}
            >
              ✏️ Edit Character
            </button>
            <button
                onClick={() => handleDelete(character.id, character.name)}
                style={{
                    marginTop: "15px",
                    padding: "10px 18px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
                >
                🗑️ Delete Character
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "35px",
    background: "#070b18",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  backButton: {
    padding: "10px 18px",
    background: "#312e81",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  subtitle: {
    color: "#94a3b8"
  },
  stats: {
    margin: "25px 0",
    padding: "20px",
    background: "linear-gradient(120deg, #1d4ed8, #312e81)",
    borderRadius: "12px",
    maxWidth: "300px"
  },
  refreshButton: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "25px"
  },
  card: {
    padding: "22px",
    background: "linear-gradient(145deg, #172554, #1e1b4b)",
    border: "1px solid #334155",
    borderRadius: "15px",
    lineHeight: "1.7",
    overflowWrap: "anywhere"
  },
  biography: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.7",
    color: "#cbd5e1"
  },
  error: {
    color: "#fca5a5"
  },
  input: {
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "8px 0 18px",
    borderRadius: "8px",
    boxSizing: "border-box"
  },
  editButton: {
    padding: "10px 18px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    marginTop: "15px"
  },
  saveButton: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px"
  },
  cancelButton: {
    padding: "10px 18px",
    background: "#64748b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default CharacterLibrary;