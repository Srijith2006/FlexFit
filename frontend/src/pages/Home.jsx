import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import styles from "./Home.module.css";

const features = [
  { icon: "🏋️", title: "Personalised Workouts", desc: "AI-assisted plans built around your goals and schedule." },
  { icon: "🥗", title: "Nutrition Tracking", desc: "Log meals, monitor macros, and get diet recommendations." },
  { icon: "📊", title: "Progress Analytics", desc: "Visual charts that keep you motivated every step of the way." },
  { icon: "🎓", title: "Expert Coaching", desc: "Connect with certified trainers for real-time guidance." },
];

const Home = () => (
  <main className={styles.main}>
    {/* Hero */}
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        Train Smarter.<br />
        <span className={styles.accent}>Live Stronger.</span>
      </h1>
      <p className={styles.heroSub}>
        FlexFit combines expert coaching, smart tracking, and community support
        to help you hit every fitness goal — faster.
      </p>
      <div className={styles.ctaGroup}>
        <Link to={ROUTES.SIGNUP} className={`${styles.btn} ${styles.btnPrimary}`}>
          Get Started Free
        </Link>
        <Link to={ROUTES.ABOUT} className={`${styles.btn} ${styles.btnOutline}`}>
          Learn More
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>Everything you need to succeed</h2>
      <div className={styles.grid}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} className={styles.card}>
            <span className={styles.icon}>{icon}</span>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDesc}>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA banner */}
    <section className={styles.banner}>
      <h2>Ready to transform your life?</h2>
      <Link to={ROUTES.PRICING} className={`${styles.btn} ${styles.btnPrimary}`}>
        View Plans
      </Link>
    </section>
  </main>
);

export default Home;