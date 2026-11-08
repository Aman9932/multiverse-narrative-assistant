import React, { useEffect, useState } from "react";

const API_URL = "https://multiverse-narrative-backend.onrender.com/api/universes";

function MultiverseBuilder() {
  const [universes, setUniverses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    genre: "",
    power_system: ""
  };

  const [form, setForm] = useState(emptyForm);

  // Load all universes
  const loadUniverses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load universes");
      }

      setUniverses(data.universes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniverses();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Create or update universe
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
      }

      setMessage(data.message);
      setForm(emptyForm);
      setEditingId(null);

      await loadUniverses();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Edit universe
  const handleEdit = (universe) => {
    setForm({
      name: universe.name,
      description: universe.description || "",
      genre: universe.genre || "",
      power_system: universe.power_system || ""
    });

    setEditingId(universe.id);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  // Delete universe
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this universe?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Delete failed");
      }

      setMessage(data.message);
      await loadUniverses();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🌌 Multiverse Builder</h1>

      <p style={styles.subtitle}>
        Create and manage your own interconnected fictional universes.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>
          {editingId ? "Edit Universe" : "Create New Universe"}
        </h2>

        <label>Universe Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Example: Earth-2099"
          required
          style={styles.input}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your universe..."
          rows="4"
          style={styles.input}
        />

        <label>Genre</label>
        <select
          name="genre"
          value={form.genre}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Genre</option>
          <option value="Sci-Fi">Science Fiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Horror">Horror</option>
          <option value="Adventure">Adventure</option>
          <option value="Superhero">Superhero</option>
          <option value="Post-Apocalyptic">Post-Apocalyptic</option>
          <option value="Other">Other</option>
        </select>

        <label>Power System</label>
        <textarea
          name="power_system"
          value={form.power_system}
          onChange={handleChange}
          placeholder="Describe the powers and rules..."
          rows="3"
          style={styles.input}
        />

        <button
          type="submit"
          disabled={saving}
          style={styles.primaryButton}
        >
          {saving
            ? "Saving..."
            : editingId
              ? "Update Universe"
              : "Create Universe"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            style={styles.cancelButton}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {message && (
        <p style={styles.success}>{message}</p>
      )}

      {error && (
        <p style={styles.error}>Error: {error}</p>
      )}

      <div style={styles.listHeader}>
        <h2>Your Universes ({universes.length})</h2>

        <button
          onClick={loadUniverses}
          style={styles.refreshButton}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading universes...</p>}

      {!loading && universes.length === 0 && (
        <p>No universes created yet.</p>
      )}

      <div style={styles.grid}>
        {universes.map((universe) => (
          <div key={universe.id} style={styles.card}>
            <h2>{universe.name}</h2>

            <p>
              <strong>Genre:</strong> {universe.genre}
            </p>

            <p>{universe.description}</p>

            <p>
              <strong>Power System:</strong>{" "}
              {universe.power_system}
            </p>

            <p style={styles.id}>Universe ID: {universe.id}</p>

            <button
              onClick={() => handleEdit(universe)}
              style={styles.editButton}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(universe.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    background: "#0b1020",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  heading: {
    fontSize: "32px"
  },
  subtitle: {
    color: "#a5b4fc",
    marginBottom: "30px"
  },
  form: {
    maxWidth: "850px",
    padding: "25px",
    background: "linear-gradient(135deg, #172554, #312e81)",
    borderRadius: "15px",
    marginBottom: "30px"
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "7px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #64748b",
    fontSize: "15px"
  },
  primaryButton: {
    padding: "12px 22px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  cancelButton: {
    padding: "12px 22px",
    marginLeft: "10px",
    background: "#64748b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  success: {
    color: "#86efac"
  },
  error: {
    color: "#fca5a5"
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px"
  },
  refreshButton: {
    padding: "10px 18px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  card: {
    padding: "22px",
    background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
    borderRadius: "14px",
    lineHeight: "1.7",
    overflowWrap: "anywhere"
  },
  id: {
    color: "#bfdbfe",
    fontSize: "13px"
  },
  editButton: {
    padding: "9px 18px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    marginRight: "10px"
  },
  deleteButton: {
    padding: "9px 18px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer"
  }
};

export default MultiverseBuilder;