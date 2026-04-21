import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";

const team = [
  { name: "Aria Chen", role: "Head of Fitness Science", avatar: "AC" },
  { name: "Marcus Reid", role: "Lead Engineer", avatar: "MR" },
  { name: "Sofia Patel", role: "Head of Nutrition", avatar: "SP" },
];

const About = () => (
  <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
    <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>About FlexFit</h1>
    <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 620 }}>
      FlexFit was founded with one belief: everyone deserves access to world-class
      fitness coaching. We combine evidence-based training science with intuitive
      technology so you spend less time planning and more time performing.
    </p>

    <h2 style={{ marginTop: 48, fontSize: "1.4rem", fontWeight: 600 }}>Our Mission</h2>
    <p style={{ color: "#555", lineHeight: 1.7 }}>
      To make personalised fitness accessible, measurable, and sustainable for
      every body — regardless of experience level or budget.
    </p>

    {/* Team */}
    <h2 style={{ marginTop: 48, fontSize: "1.4rem", fontWeight: 600 }}>Meet the Team</h2>
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 24 }}>
      {team.map(({ name, role, avatar }) => (
        <div key={name} style={{ textAlign: "center", width: 160 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#4f46e5", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, margin: "0 auto 12px"
          }}>
            {avatar}
          </div>
          <p style={{ fontWeight: 600, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 13, color: "#777", margin: "4px 0 0" }}>{role}</p>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 48 }}>
      <Link to={ROUTES.PRICING} style={{
        background: "#4f46e5", color: "#fff",
        padding: "12px 28px", borderRadius: 8, textDecoration: "none",
        fontWeight: 600, fontSize: 15
      }}>
        Explore Plans →
      </Link>
    </div>
  </main>
);

export default About;