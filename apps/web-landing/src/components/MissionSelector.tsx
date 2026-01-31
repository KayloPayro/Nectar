"use client";

import React, { useState } from "react";

const MISSIONS = [
  {
    id: "small",
    title: "המסלול המהיר",
    reward: "צ'ייסר חינם",
    requirement: "חבר אחד מגיע",
    icon: "🥃",
  },
  {
    id: "medium",
    title: "המסלול המשתלם",
    reward: "מנה ראשונה מתנה",
    requirement: "3 חברים מגיעים",
    icon: "🥗",
  },
  {
    id: "large",
    title: "מסלול ה-VIP",
    reward: '150 ש"ח קרדיט',
    requirement: "5 חברים מגיעים",
    icon: "💰",
  },
];

export default function MissionSelector({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerateLink = () => {
    if (!selectedMission) return alert("אנא בחר מסלול קודם");
    setIsGenerated(true);
    // כאן בעתיד תהיה קריאה ל-DB לשמור את הבחירה
  };

  if (isGenerated) {
    const shareUrl = `${window.location.origin}/?rest=${restaurantId}&ref=USER_ID_123`;
    return (
      <div style={styles.shareBox}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
          הלינק שלך מוכן! 🎉
        </h2>
        <p>
          שתף אותו עם חברים וקבל{" "}
          {MISSIONS.find((m) => m.id === selectedMission)?.reward}
        </p>
        <div style={styles.linkDisplay}>{shareUrl}</div>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          style={styles.copyButton}
        >
          העתק לינק ושיתוף
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: "20px" }}>בחר את הבונוס שתרצה לקבל:</h3>
      <div style={styles.grid}>
        {MISSIONS.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMission(m.id)}
            style={{
              ...styles.card,
              borderColor: selectedMission === m.id ? "#ff4d4d" : "#eee",
              backgroundColor: selectedMission === m.id ? "#fff5f5" : "#fff",
            }}
          >
            <span style={{ fontSize: "2rem" }}>{m.icon}</span>
            <h4 style={{ margin: "10px 0" }}>{m.title}</h4>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>{m.requirement}</p>
            <p style={{ fontWeight: "bold", color: "#ff4d4d" }}>{m.reward}</p>
          </div>
        ))}
      </div>
      <button onClick={handleGenerateLink} style={styles.mainButton}>
        צור לינק שגריר עבורי
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { marginTop: "20px", width: "100%" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "20px",
  },
  card: {
    padding: "15px",
    border: "2px solid",
    borderRadius: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center" as const,
  },
  mainButton: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: "18px",
    borderRadius: "50px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  shareBox: {
    padding: "20px",
    border: "2px dashed #ff4d4d",
    borderRadius: "15px",
    backgroundColor: "#fff5f5",
  },
  linkDisplay: {
    padding: "10px",
    background: "#fff",
    borderRadius: "5px",
    fontSize: "0.8rem",
    margin: "15px 0",
    border: "1px solid #ddd",
    overflow: "hidden",
  },
  copyButton: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "50px",
    fontWeight: "bold",
    width: "100%",
  },
};
