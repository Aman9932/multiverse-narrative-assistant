import React, { useEffect, useState } from "react";

const API_URL = `${process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"}/api/timeline/events`;

function TimelineManager({ token, onBack }) {
  const mobileStyles = `
    @media (max-width: 600px) {
      .timeline-manager {
        width: calc(100% - 24px) !important;
        margin: 12px auto !important;
        padding: 16px !important;
        border-radius: 12px !important;
      }

      .timeline-manager h1 {
        font-size: 25px;
      }

      .timeline-manager h2 {
        font-size: 21px;
      }

      .timeline-manager input,
      .timeline-manager textarea {
        width: 100%;
        font-size: 16px;
      }

      .timeline-manager button {
        min-height: 44px;
      }

      .timeline-manager .event-card {
        padding: 15px !important;
        overflow-wrap: anywhere;
      }

      .timeline-manager .event-actions {
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .timeline-manager .event-actions button {
        width: 100%;
        margin: 0 !important;
      }
    }
  `;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    event_time: "",
    character_name: "",
    universe: ""
  };

  const [form, setForm] = useState(emptyForm);

  // Load all timeline events
  const loadEvents = async () => {
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
        throw new Error(data.detail || "Failed to load events");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [token]);

  // Handle form inputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Add or update event
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
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not save event");
      }

      setMessage(
        editingId
          ? "Event updated successfully!"
          : "Event added successfully!"
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadEvents();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Edit event
  const handleEdit = (event) => {
    setEditingId(event.id);

    setForm({
      title: event.title || "",
      description: event.description || "",
      event_time: event.event_time || "",
      character_name: event.character_name || "",
      universe: event.universe || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
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
        throw new Error(data.detail || "Could not delete event");
      }

      setMessage("Event deleted successfully!");
      await loadEvents();

    } catch (err) {
      setError(err.message);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "12px",
    marginTop: "7px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #64748b",
    boxSizing: "border-box",
    fontSize: "15px"
  };

  const buttonStyle = {
    padding: "11px 20px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    marginRight: "10px"
  };

  return (
    <>
    <style>{mobileStyles}</style>

    <div className="timeline-manager" style={{
      maxWidth: "950px",
      margin: "30px auto",
      padding: "25px",
      background: "#0f172a",
      color: "white",
      borderRadius: "15px",
      fontFamily: "Arial, sans-serif"
    }}>

      <button
        onClick={onBack}
        style={{
          ...buttonStyle,
          background: "#312e81",
          marginBottom: "20px"
        }}
      >
        ← Back to Dashboard
      </button>

      <h1>Timeline Manager</h1>

      <p style={{ color: "#cbd5e1" }}>
        Organize your story events across different universes.
      </p>

      {/* Event Form */}
      <div style={{
        background: "#172554",
        padding: "22px",
        borderRadius: "12px"
      }}>

        <h2>
          {editingId ? "Edit Timeline Event" : "Add New Event"}
        </h2>

        <form onSubmit={handleSubmit}>

          <label>Event Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
            style={inputStyle}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the event..."
            rows="4"
            style={{
              ...inputStyle,
              resize: "vertical"
            }}
          />

          <label>Event Date & Time</label>
          <input
            type="datetime-local"
            name="event_time"
            value={form.event_time}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>Character Name</label>
          <input
            name="character_name"
            value={form.character_name}
            onChange={handleChange}
            placeholder="Enter character name"
            style={inputStyle}
          />

          <label>Universe</label>
          <input
            name="universe"
            value={form.universe}
            onChange={handleChange}
            placeholder="Example: Earth-2099"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              background: "#2563eb"
            }}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Event"
                : "Add Event"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                ...buttonStyle,
                background: "#64748b"
              }}
            >
              Cancel
            </button>
          )}

        </form>
      </div>

      {/* Messages */}
      {message && (
        <p style={{ color: "#86efac" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "#fca5a5" }}>Error: {error}</p>
      )}

      {/* Timeline Events */}
      <h2 style={{ marginTop: "35px" }}>
        Your Story Timeline
      </h2>

      <button
        onClick={loadEvents}
        disabled={loading}
        style={{
          ...buttonStyle,
          background: "#334155",
          marginBottom: "20px"
        }}
      >
        {loading ? "Loading..." : "Refresh Timeline"}
      </button>

      {loading && <p>Loading events...</p>}

      {!loading && events.length === 0 && (
        <p style={{ color: "#94a3b8" }}>
          No timeline events yet. Add your first event!
        </p>
      )}

      <div style={{
        display: "grid",
        gap: "18px"
      }}>

        {[...events]
          .sort((a, b) =>
            String(a.event_time).localeCompare(String(b.event_time))
          )
          .map((event) => (

            <div
              key={event.id}
              className="event-card"
              style={{
                background: "#1e3a8a",
                padding: "20px",
                borderRadius: "12px",
                borderLeft: "5px solid #38bdf8"
              }}
            >

              <h3>{event.title}</h3>

              <p style={{ color: "#bfdbfe" }}>
                {event.event_time}
              </p>

              <p>{event.description}</p>

              <p>
                <strong>Character:</strong>{" "}
                {event.character_name || "Not specified"}
              </p>

              <p>
                <strong>Universe:</strong>{" "}
                {event.universe || "Not specified"}
              </p>

              <div className="event-actions">

              <button
                onClick={() => handleEdit(event)}
                style={{
                  ...buttonStyle,
                  background: "#0f766e"
                }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(event.id)}
                style={{
                  ...buttonStyle,
                  background: "#dc2626"
                }}
              >
                Delete
              </button>

            </div>

            </div>
          ))}

      </div>

    </div>
    </>
  );
}

export default TimelineManager;