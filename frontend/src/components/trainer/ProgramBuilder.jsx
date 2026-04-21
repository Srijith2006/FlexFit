import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, DIFFICULTY_LEVELS, EXERCISE_CATEGORIES } from "../../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const emptyExercise = () => ({ name: "", sets: "", reps: "", durationMin: "", category: EXERCISE_CATEGORIES[0], notes: "" });

const ProgramBuilder = () => {
  const [program, setProgram] = useState({
    title: "", description: "", difficulty: DIFFICULTY_LEVELS[0],
    durationWeeks: 4, exercises: [],
  });
  const [exercise, setExercise] = useState(emptyExercise());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addExercise = () => {
    if (!exercise.name) return;
    setProgram((p) => ({ ...p, exercises: [...p.exercises, { ...exercise, id: Date.now() }] }));
    setExercise(emptyExercise());
  };

  const removeExercise = (id) =>
    setProgram((p) => ({ ...p, exercises: p.exercises.filter((e) => e.id !== id) }));

  const handleSave = async () => {
    if (!program.title || program.exercises.length === 0) {
      setError("Add a title and at least one exercise.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/programs", program);
      setSaved(true);
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: "9px 12px", borderRadius: 7, border: "1px solid #e2e8f0",
    fontSize: 14, width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Program Builder</h2>
      {saved && <p style={{ color: "#059669", marginBottom: 16 }}>Program saved successfully ✓</p>}
      {error && <p style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</p>}

      {/* Program meta */}
      <section style={{ background: "#f9fafb", borderRadius: 10, padding: 24, marginBottom: 28 }}>
        <h3 style={{ margin: "0 0 16px", fontWeight: 600 }}>Program Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Title</label>
            <input required style={inputStyle} placeholder="e.g. 4-Week Strength Foundation"
              value={program.title}
              onChange={(e) => setProgram((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 72 }} placeholder="Goals, who it's for…"
              value={program.description}
              onChange={(e) => setProgram((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Difficulty</label>
            <select style={inputStyle} value={program.difficulty}
              onChange={(e) => setProgram((p) => ({ ...p, difficulty: e.target.value }))}>
              {DIFFICULTY_LEVELS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Duration (weeks)</label>
            <input type="number" min={1} max={52} style={inputStyle} value={program.durationWeeks}
              onChange={(e) => setProgram((p) => ({ ...p, durationWeeks: e.target.value }))} />
          </div>
        </div>
      </section>

      {/* Add exercise */}
      <section style={{ background: "#f9fafb", borderRadius: 10, padding: 24, marginBottom: 28 }}>
        <h3 style={{ margin: "0 0 16px", fontWeight: 600 }}>Add Exercise</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Exercise name</label>
            <input style={inputStyle} value={exercise.name}
              onChange={(e) => setExercise((x) => ({ ...x, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Category</label>
            <select style={inputStyle} value={exercise.category}
              onChange={(e) => setExercise((x) => ({ ...x, category: e.target.value }))}>
              {EXERCISE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {[["Sets", "sets"], ["Reps", "reps"], ["Duration (min)", "durationMin"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 500 }}>{label}</label>
              <input type="number" min={0} style={inputStyle} value={exercise[key]}
                onChange={(e) => setExercise((x) => ({ ...x, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500 }}>Notes</label>
            <input style={inputStyle} value={exercise.notes}
              onChange={(e) => setExercise((x) => ({ ...x, notes: e.target.value }))} />
          </div>
        </div>
        <button onClick={addExercise} style={{
          marginTop: 14, padding: "9px 20px", borderRadius: 7, background: "#1a202c",
          color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14,
        }}>
          + Add to Program
        </button>
      </section>

      {/* Exercise list */}
      {program.exercises.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
            Exercises ({program.exercises.length})
          </h3>
          {program.exercises.map((ex, i) => (
            <div key={ex.id} style={{
              border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px",
              marginBottom: 10, background: "#fff",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{i + 1}. {ex.name}</span>
                <span style={{ fontSize: 13, color: "#666", marginLeft: 12 }}>
                  {ex.sets && `${ex.sets} sets`}
                  {ex.reps && ` × ${ex.reps} reps`}
                  {ex.durationMin && ` · ${ex.durationMin} min`}
                  {" · "}{ex.category}
                </span>
              </div>
              <button onClick={() => removeExercise(ex.id)} style={{
                border: "none", background: "none", color: "#dc2626",
                fontWeight: 600, cursor: "pointer", fontSize: 13,
              }}>
                Remove
              </button>
            </div>
          ))}
        </section>
      )}

      <button onClick={handleSave} disabled={saving} style={{
        padding: "12px 32px", borderRadius: 8, background: "#4f46e5",
        color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 15,
      }}>
        {saving ? "Saving…" : "Save Program"}
      </button>
    </div>
  );
};

export default ProgramBuilder;