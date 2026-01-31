"use client";
import { LogIn } from "lucide-react";

export default function AuthButton() {
  const handleLogin = () => {
    // כאן נפעיל את ה-SignIn של NextAuth בהמשך
    console.log("Triggering Google/Apple Auth...");
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-2xl hover:bg-gray-900 transition-colors"
    >
      <LogIn size={20} />
      התחילו עכשיו בטאפ אחד
    </button>
  );
}
