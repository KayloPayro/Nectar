export default function Header() {
  return (
    <header className="w-full h-[72px] px-6 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          N
        </div>
        <span className="font-black tracking-tighter text-xl text-white">
          NECTAR
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/5" />
      </div>
    </header>
  );
}
