import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, MEAL_TYPES } from "../../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const empty = () => ({ foodName: "", calories: "", protein: "", carbs: "", fat: "", mealType: MEAL_TYPES[0] });

const DietLog = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(empty());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const fetchEntries = async () => {
    try {
      const { data } = await api.get(`/diet?date=${today}`);
      setEntries(data.entries);
    } catch {
      setError("Could not load diet log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/diet", { ...form, date: today });
      setEntries((prev) => [data.entry, ...prev]);
      setForm(empty());
    } catch {
      setError("Failed to log entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/diet/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  const totalCals = entries.reduce((s, e) => s + Number(e.calories || 0), 0);

  const inputStyle = {
    padding: "9px 12px", borderRadius: 7, border: "1px solid #e2e8f0",
    fontSize: 14, width: "100%", boxSizing: "border-box",
  };

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Diet Log</h2>
      <p style={{ color: "#777", marginBottom: 24 }}>
        {today} · Total calories today: <strong>{totalCals} kcal</strong>
      </p>
      {error && <p style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</p>}

      {/* Entry form */}
      <form onSubmit={handleSubmit} style={{
        background: "#f9fafb", borderRadius: 10, padding: 24, marginBottom: 32,
        display: "grid", gap: 14,
      }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Add Entry</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Food name</label>
            <input required style={inputStyle} value={form.foodName}
              onChange={(e) => setForm((f) => ({ ...f, foodName: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Meal type</label>
            <select style={inputStyle} value={form.mealType}
              onChange={(e) => setForm((f) => ({ ...f, mealType: e.target.value }))}>
              {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          {[["Calories (kcal)", "calories"], ["Protein (g)", "protein"], ["Carbs (g)", "carbs"], ["Fat (g)", "fat"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 500 }}>{label}</label>
              <input type="number" min="0" style={inputStyle} value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button type="submit" disabled={submitting} style={{
          padding: "10px 0", borderRadius: 8, background: "#4f46e5",
          color: "#fff", border: "none", fontWeight: 600, cursor: "pointer",
        }}>
          {submitting ? "Logging…" : "Log Meal"}
        </button>
      </form>

      {/* Entries list */}
      {entries.length === 0
        ? <p style={{ color: "#777" }}>No meals logged today.</p>
        : entries.map((entry) => (
          <div key={entry._id} style={{
            border: "1px solid #e2e8f0", borderRadius: 9, padding: 16,
            marginBottom: 12, background: "#fff",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{entry.foodName}</p>
              <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
                {entry.mealType} · {entry.calories} kcal
              </p>
              <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>
                P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
              </p>
            </div>
            <button onClick={() => handleDelete(entry._id)} style={{
              border: "none", background: "none", cursor: "pointer",
              color: "#dc2626", fontWeight: 600, fontSize: 13,
            }}>
              Remove
            </button>
          </div>
        ))
      }
    </div>
  );
};

export default DietLog;