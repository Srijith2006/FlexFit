import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, VERIFICATION_STATUS } from "../../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const badge = (status) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === VERIFICATION_STATUS.APPROVED ? "#d1fae5"
    : status === VERIFICATION_STATUS.REJECTED ? "#fee2e2"
    : "#fef3c7",
  color:
    status === VERIFICATION_STATUS.APPROVED ? "#065f46"
    : status === VERIFICATION_STATUS.REJECTED ? "#991b1b"
    : "#92400e",
});

const VerificationReview = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/admin/verifications");
      setRequests(data.verifications);
    } catch {
      setError("Failed to load verification requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.patch(`/admin/verifications/${id}`, { status: action });
      setRequests((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: action } : r)
      );
    } catch {
      setError("Action failed. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading requests…</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Trainer Verification Requests</h2>
      {error && <p style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</p>}
      {requests.length === 0 && <p style={{ color: "#777" }}>No pending requests.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {requests.map((r) => (
          <div key={r._id} style={{
            border: "1px solid #e2e8f0", borderRadius: 10, padding: 20,
            background: "#fff",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{r.trainerName}</p>
                <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>{r.email}</p>
                <p style={{ fontSize: 13, color: "#777", margin: "6px 0 0" }}>
                  Speciality: {r.speciality} · Experience: {r.yearsOfExperience}yr
                </p>
              </div>
              <span style={badge(r.status)}>{r.status}</span>
            </div>
            {r.bio && <p style={{ fontSize: 13, color: "#444", margin: "12px 0 0" }}>{r.bio}</p>}
            {r.certificationUrl && (
              <a href={r.certificationUrl} target="_blank" rel="noreferrer"
                style={{ fontSize: 13, color: "#4f46e5", display: "block", marginTop: 8 }}>
                View Certification ↗
              </a>
            )}
            {r.status === VERIFICATION_STATUS.PENDING && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  onClick={() => handleAction(r._id, VERIFICATION_STATUS.APPROVED)}
                  disabled={!!actionLoading}
                  style={{
                    padding: "8px 18px", borderRadius: 7, border: "none",
                    background: "#059669", color: "#fff", fontWeight: 600, cursor: "pointer",
                  }}>
                  {actionLoading === r._id + VERIFICATION_STATUS.APPROVED ? "…" : "Approve"}
                </button>
                <button
                  onClick={() => handleAction(r._id, VERIFICATION_STATUS.REJECTED)}
                  disabled={!!actionLoading}
                  style={{
                    padding: "8px 18px", borderRadius: 7, border: "none",
                    background: "#dc2626", color: "#fff", fontWeight: 600, cursor: "pointer",
                  }}>
                  {actionLoading === r._id + VERIFICATION_STATUS.REJECTED ? "…" : "Reject"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationReview;