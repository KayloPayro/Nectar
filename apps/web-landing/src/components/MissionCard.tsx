export default function MissionCard({
  tier,
  reward,
  requirement,
  icon,
  featured,
}: any) {
  return (
    <div
      className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 active:scale-95 ${
        featured
          ? "border-orange-500 bg-[#111] shadow-[0_20px_40px_rgba(249,115,22,0.15)]"
          : "border-white/5 bg-[#0f0f0f]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
              featured ? "bg-orange-500/20" : "bg-white/5"
            }`}
          >
            {icon}
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {tier}
            </h3>
            <p className="text-xl font-black text-white leading-tight">
              {reward}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{requirement}</p>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center ${
            featured ? "border-orange-500 bg-orange-500" : "border-white/10"
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={featured ? "black" : "white"}
            strokeWidth="4"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
