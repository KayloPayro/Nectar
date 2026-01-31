"use client";

import React, { use, useState } from "react";

// --- הגדרת המשימות (Missions) ---
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

type Props = {
  searchParams: Promise<{ ref?: string; rest?: string }>;
};

export default function LandingPage({ searchParams }: Props) {
  // פתיחת ה-Promise של ה-searchParams ב-Client Component
  const params = use(searchParams);
  const isGuestMode = !!params.ref;
  const restaurantId = params.rest || "shila-rest";

  // State לניהול בחירת המשימה
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const restaurantName = "Shila - שילה";
  const inviterName = "אביב";

  const handleGenerateLink = () => {
    if (!selectedMission) return alert("אנא בחר מסלול קודם");
    setIsGenerated(true);
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?rest=${restaurantId}&ref=USER_123`
      : "";

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.brand}>Nectar</span>
        <span style={styles.divider}>|</span>
        <span style={styles.restName}>{restaurantName}</span>
      </header>

      <section style={styles.hero}>
        <div style={styles.content}>
          {isGuestMode ? (
            /* --- מצב מוזמן --- */
            <>
              <h1 style={styles.title}>{inviterName} שלח לך פינוק! 🎁</h1>
              <p style={styles.subtitle}>
                מחכה לך מנה ראשונה מתנה ב-<strong>{restaurantName}</strong>.
              </p>
              <button style={styles.mainButton}>שמרו לי את ההטבה</button>
            </>
          ) : (
            /* --- מצב שגריר --- */
            <>
              {isGenerated ? (
                /* מסך אחרי יצירת לינק */
                <div style={styles.shareBox}>
                  <h2 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>
                    הלינק שלך מוכן! 🎉
                  </h2>
                  <p style={{ marginBottom: "20px" }}>
                    שתף אותו עם חברים. ברגע שהם יגיעו, תקבל: <br />
                    <strong>
                      {MISSIONS.find((m) => m.id === selectedMission)?.reward}
                    </strong>
                  </p>
                  <div style={styles.linkDisplay}>{shareUrl}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("הלינק הועתק! שלחו אותו בוואטסאפ");
                    }}
                    style={styles.copyButton}
                  >
                    העתק לינק ושיתוף לחברים
                  </button>
                  <button
                    onClick={() => setIsGenerated(false)}
                    style={{
                      marginTop: "15px",
                      background: "none",
                      border: "none",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    שינוי מסלול
                  </button>
                </div>
              ) : (
                /* מסך בחירת משימה */
                <>
                  <h1 style={styles.title}>הארוחה הזאת יכולה להיות בחינם.</h1>
                  <p style={styles.subtitle}>
                    בחר את הבונוס שתרצה לקבל, ושלח לינק לחברים:
                  </p>

                  <div style={styles.grid}>
                    {MISSIONS.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMission(m.id)}
                        style={{
                          ...styles.card,
                          borderColor:
                            selectedMission === m.id ? "#ff4d4d" : "#eee",
                          backgroundColor:
                            selectedMission === m.id ? "#fff5f5" : "#fff",
                          transform:
                            selectedMission === m.id
                              ? "scale(1.02)"
                              : "scale(1)",
                        }}
                      >
                        <span style={{ fontSize: "2rem" }}>{m.icon}</span>
                        <h4 style={{ margin: "8px 0" }}>{m.title}</h4>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            marginBottom: "5px",
                          }}
                        >
                          {m.requirement}
                        </p>
                        <p
                          style={{
                            fontWeight: "bold",
                            color: "#ff4d4d",
                            fontSize: "0.9rem",
                          }}
                        >
                          {m.reward}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateLink}
                    style={styles.mainButton}
                  >
                    צור לינק שגריר עבורי
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ marginBottom: "10px", fontSize: "0.9rem" }}>
          רוצים לעקוב אחרי הבונוסים שלכם?
        </p>
        <button style={styles.appButton}>הורידו את אפליקציית Nectar</button>
      </footer>
    </main>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    direction: "rtl",
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  header: {
    padding: "15px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #f0f0f0",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  brand: { fontWeight: "bold", fontSize: "1.3rem", color: "#ff4d4d" },
  divider: { color: "#ddd" },
  restName: { fontWeight: 500, fontSize: "1rem" },
  hero: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    textAlign: "center" as const,
  },
  content: { width: "100%", maxWidth: "450px" },
  title: {
    fontSize: "2.2rem",
    fontWeight: "800",
    marginBottom: "15px",
    lineHeight: "1.1",
  },
  subtitle: {
    fontSize: "1.1rem",
    marginBottom: "30px",
    color: "#555",
    lineHeight: "1.4",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "25px",
  },
  card: {
    padding: "15px 10px",
    border: "2px solid",
    borderRadius: "18px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  shareBox: {
    padding: "30px 20px",
    border: "2px dashed #ff4d4d",
    borderRadius: "24px",
    backgroundColor: "#fff5f5",
    animation: "fadeIn 0.5s ease",
  },
  linkDisplay: {
    padding: "12px",
    background: "#fff",
    borderRadius: "10px",
    fontSize: "0.85rem",
    margin: "15px 0",
    border: "1px solid #eee",
    color: "#666",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyButton: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "16px 20px",
    borderRadius: "50px",
    fontWeight: "bold",
    width: "100%",
    fontSize: "1rem",
    cursor: "pointer",
  },
  footer: {
    padding: "30px 20px",
    backgroundColor: "#fafafa",
    textAlign: "center" as const,
    borderTop: "1px solid #f0f0f0",
  },
  appButton: {
    backgroundColor: "transparent",
    color: "#1a1a1a",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "600",
    border: "2px solid #1a1a1a",
    cursor: "pointer",
  },
};
