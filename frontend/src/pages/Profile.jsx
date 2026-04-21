import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, changePassword } from "../services/authService";

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "", bio: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState({ profile: "", password: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((d) => {
      setProfile({ name: d.user.name, email: d.user.email, bio: d.user.bio || "" });
      setLoading(false);
    });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      setMsg((m) => ({ ...m, profile: "Profile updated ✓" }));
    } catch {
      setMsg((m) => ({ ...m, profile: "Update failed." }));
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwords.current, passwords.next);
      setMsg((m) => ({ ...m, password: "Password changed ✓" }));
      setPasswords({ current: "", next: "" });
    } catch {
      setMsg((m) => ({ ...m, password: "Password change failed." }));
    }
  };

  if (loading) return <p style={{ padding: 32 }}>Loading profile…</p>;

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: 14, marginTop: 6, boxSizing: "border-box",
  };
  const btnStyle = {
    marginTop: 16, padding: "10px 24px", borderRadius: 8,
    background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600,
    cursor: "pointer", fontSize: 14,
  };

  return (
    <main style={{ maxWidth: 540, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontWeight: 700, fontSize: "1.8rem", marginBottom: 32 }}>Your Profile</h1>

      {/* Profile form */}
      <section style={{ background: "#f9fafb", borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20 }}>Personal Info</h2>
        <form onSubmit={saveProfile}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Name
            <input style={inputStyle} value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginTop: 14 }}>Email
            <input style={inputStyle} type="email" value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginTop: 14 }}>Bio
            <textarea style={{ ...inputStyle, minHeight: 80 }} value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
          </label>
          <button type="submit" style={btnStyle}>Save Changes</button>
          {msg.profile && <p style={{ marginTop: 10, fontSize: 13, color: "#4f46e5" }}>{msg.profile}</p>}
        </form>
      </section>

      {/* Password form */}
      <section style={{ background: "#f9fafb", borderRadius: 12, padding: 28 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 20 }}>Change Password</h2>
        <form onSubmit={savePassword}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>Current Password
            <input style={inputStyle} type="password" value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
          </label>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginTop: 14 }}>New Password
            <input style={inputStyle} type="password" value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} />
          </label>
          <button type="submit" style={btnStyle}>Update Password</button>
          {msg.password && <p style={{ marginTop: 10, fontSize: 13, color: "#4f46e5" }}>{msg.password}</p>}
        </form>
      </section>
    </main>
  );
};

export default Profile;