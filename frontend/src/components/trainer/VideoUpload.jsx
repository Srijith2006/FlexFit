import React, { useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_MB = 200;

const VideoUpload = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ title: "", description: "", tags: "" });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported format. Use MP4, WebM, or MOV.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_MB} MB limit.`);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !meta.title) {
      setError("Please select a file and enter a title.");
      return;
    }
    const form = new FormData();
    form.append("video", file);
    form.append("title", meta.title);
    form.append("description", meta.description);
    form.append("tags", meta.tags);

    setStatus("uploading");
    setProgress(0);
    setError("");

    try {
      await api.post("/videos/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setStatus("done");
      setFile(null);
      setMeta({ title: "", description: "", tags: "" });
    } catch {
      setStatus("error");
      setError("Upload failed. Please try again.");
    }
  };

  const inputStyle = {
    padding: "9px 12px", borderRadius: 7, border: "1px solid #e2e8f0",
    fontSize: 14, width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Upload Training Video</h2>
      {error && <p style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</p>}
      {status === "done" && (
        <p style={{ color: "#059669", marginBottom: 16 }}>Video uploaded successfully ✓</p>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile({ target: { files: [f] } });
        }}
        style={{
          border: "2px dashed #c7d2fe", borderRadius: 12, padding: "40px 24px",
          textAlign: "center", cursor: "pointer", marginBottom: 24,
          background: file ? "#f0fdf4" : "#fafafa",
        }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFile} style={{ display: "none" }} />
        <p style={{ fontSize: 32, margin: "0 0 8px" }}>🎬</p>
        {file
          ? <p style={{ fontWeight: 600 }}>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
          : <><p style={{ fontWeight: 500, marginBottom: 4 }}>Drag & drop or click to select</p>
              <p style={{ fontSize: 13, color: "#777" }}>MP4, WebM or MOV · max {MAX_MB} MB</p></>
        }
      </div>

      {/* Metadata */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500 }}>Title *</label>
          <input required style={inputStyle} value={meta.title}
            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500 }}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 72 }} value={meta.description}
            onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500 }}>Tags (comma-separated)</label>
          <input style={inputStyle} placeholder="e.g. strength, beginner, chest" value={meta.tags}
            onChange={(e) => setMeta((m) => ({ ...m, tags: e.target.value }))} />
        </div>
      </div>

      {/* Progress bar */}
      {status === "uploading" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: "#e2e8f0", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#4f46e5",
              width: `${progress}%`, transition: "width 0.2s",
            }} />
          </div>
          <p style={{ fontSize: 13, color: "#555", marginTop: 6 }}>{progress}% uploaded</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={status === "uploading" || !file}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
          background: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: status === "uploading" || !file ? "not-allowed" : "pointer",
          opacity: status === "uploading" || !file ? 0.7 : 1,
        }}
      >
        {status === "uploading" ? "Uploading…" : "Upload Video"}
      </button>
    </div>
  );
};

export default VideoUpload;