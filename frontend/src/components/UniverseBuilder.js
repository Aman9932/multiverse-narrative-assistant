import React, { useEffect, useState } from "react";

const API_URL = `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api/universes`;

function UniverseBuilder({ token, onBack }) {
  const mobileStyles = `
    @media (max-width: 600px) {
      .universe-builder {
        padding: 16px !important;
      }

      .universe-builder h1 {
        font-size: 25px;
      }

      .universe-builder h2 {
        font-size: 21px;
      }

      .universe-builder input,
      .universe-builder textarea {
        width: 100%;
        font-size: 16px;
      }

      .universe-builder button {
        min-height: 44px;
      }

      .universe-builder .universe-form {
        padding: 16px !important;
      }

      .universe-builder .universe-grid {
        grid-template-columns: 1fr !important;
        gap: 14px;
      }

      .universe-builder .universe-card {
        padding: 16px !important;
        overflow-wrap: anywhere;
      }

      .universe-builder .universe-actions {
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .universe-builder .universe-actions button {
        width: 100%;
        margin: 0 !important;
      }
    }

    @media (min-width: 601px) and (max-width: 900px) {
      .universe-builder .universe-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
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
      const response = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load universes");
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
  }, [token]);

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

    const isEditing = editingId !== null;

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save universe");
      }

      setMessage(
        isEditing
          ? "Universe updated successfully!"
          : "Universe created successfully!"
      );

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
    setEditingId(universe.id);

    setForm({
      name: universe.name || "",
      description: universe.description || "",
      genre: universe.genre || "",
      power_system: universe.power_system || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete universe");
      }

      setMessage("Universe deleted successfully!");
      await loadUniverses();

    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  return (
    <>
      <style>{mobileStyles}</style>

      <div className="universe-builder" style={styles.container}>

        <button
            onClick={onBack}
            style={{
                padding: "10px 18px",
                background: "#312e81",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "20px"
            }}
            >
            ← Back to Dashboard
        </button>

      <h1>🌌 Multiverse Builder</h1>

      <p style={styles.subtitle}>
        Create and manage your own fictional universes.
      </p>

      <form
        className="universe-form"
        onSubmit={handleSubmit}
        style={styles.form}
      >

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
          required
          style={styles.textarea}
        />

        <label>Genre</label>
        <input
          name="genre"
          value={form.genre}
          onChange={handleChange}
          placeholder="Example: Sci-Fi, Fantasy, Horror"
          required
          style={styles.input}
        />

        <label>Power System</label>
        <input
          name="power_system"
          value={form.power_system}
          onChange={handleChange}
          placeholder="Example: Time Travel, Magic, Quantum Energy"
          required
          style={styles.input}
        />

        <button type="submit" disabled={saving} style={styles.button}>
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

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>Error: {error}</p>}

      <section>
        <h2>Your Universes</h2>

        <button
          onClick={loadUniverses}
          style={styles.refreshButton}
        >
          Refresh Universes
        </button>

        {loading && <p>Loading universes...</p>}

        {!loading && universes.length === 0 && (
          <p>No universes created yet.</p>
        )}

          {universes.map((universe) => (
            <div
              key={universe.id}
              className="universe-card"
              style={styles.card}
            >

              <h2>🌌 {universe.name}</h2>

              <p>{universe.description}</p>

              <p>
                <strong>Genre:</strong> {universe.genre}
              </p>

              <p>
                <strong>Power System:</strong> {universe.power_system}
              </p>

              <div className="universe-actions">

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

            </div>
          ))}
      </section>
    </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "35px",
    background: "#0b1020",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  subtitle: {
    color: "#9ca3af"
  },
  form: {
    maxWidth: "850px",
    margin: "25px auto",
    padding: "25px",
    background: "#172554",
    borderRadius: "15px"
  },
  input: {
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "8px 0 18px",
    boxSizing: "border-box",
    borderRadius: "8px"
  },
  textarea: {
    display: "block",
    width: "100%",
    minHeight: "110px",
    padding: "12px",
    margin: "8px 0 18px",
    boxSizing: "border-box",
    borderRadius: "8px"
  },
  button: {
    padding: "12px 22px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  cancelButton: {
    padding: "12px",
    marginLeft: "10px",
    background: "#64748b",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },
  refreshButton: {
    padding: "10px 18px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  card: {
    padding: "22px",
    background: "linear-gradient(135deg, #1e40af, #312e81)",
    borderRadius: "14px",
    lineHeight: "1.7"
  },
  editButton: {
    padding: "9px 18px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "7px",
    marginRight: "10px"
  },
  deleteButton: {
    padding: "9px 18px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "7px"
  },
  success: {
    color: "#86efac"
  },
  error: {
    color: "#fca5a5"
  }
};

export default UniverseBuilder;