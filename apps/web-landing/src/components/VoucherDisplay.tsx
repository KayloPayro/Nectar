export default function VoucherDisplay({ title, subtitle, code }: any) {
  return (
    <div className="relative w-full p-8 rounded-[2.5rem] bg-[#111] border-2 border-dashed border-orange-500/30 overflow-hidden shadow-2xl">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border-r border-orange-500/30" />
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border-l border-orange-500/30" />

      <div className="text-center">
        <span className="text-orange-500 font-black text-5xl tracking-tighter block mb-2">
          {title}
        </span>
        <span className="text-white font-medium text-lg opacity-80">
          {subtitle}
        </span>

        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">
            קוד הטבה
          </p>
          <div className="bg-white/5 py-3 rounded-xl font-mono text-xl text-orange-500 tracking-[0.3em]">
            {code}
          </div>
        </div>
      </div>
    </div>
  );
}
