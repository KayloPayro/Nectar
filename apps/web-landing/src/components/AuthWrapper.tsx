"use client";
import { useState } from "react";

export default function AuthWrapper({ mode }: { mode: "CLAIM" | "CREATE" }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // סימולציה של חיבור ומימוש
    setTimeout(() => {
      alert(
        mode === "CLAIM" ? "הקופון נשמר בארנק שלך!" : "לינק השגריר שלך מוכן!",
      );
      setLoading(false);
      // כאן יבוא ה-Logic של ה-Flip
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 text-black font-black text-xl py-5 rounded-[2rem] shadow-[0_15px_40px_rgba(249,115,22,0.3)] transition-all active:scale-95"
    >
      {loading
        ? "מעבד..."
        : mode === "CLAIM"
          ? "מימוש הטבה וקבלת קוד"
          : "צרו לי לינק שגריר"}
    </button>
  );
}
