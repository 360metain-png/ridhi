export default function Slide6() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">Traction</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Early Metrics Show Strong Product-Market Fit
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-[3vw]">
          {/* Top Row Stats */}
          <div className="bg-gradient-to-br from-[#7B2FBE]/20 to-[#7B2FBE]/5 border border-[#7B2FBE]/30 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="text-[4vw] font-black text-[#7B2FBE]">250K</div>
            <p className="text-[1.2vw] text-white font-medium mt-2">Downloads</p>
            <p className="text-[0.9vw] text-[#A0A0A0] mt-1">First 90 days post-launch</p>
            <div className="mt-4 flex items-center gap-1 text-[#10B981] text-[0.9vw]">
              <span>&#9650;</span>
              <span className="font-bold">+32% MoM</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 border border-[#E91E8C]/30 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="text-[4vw] font-black text-[#E91E8C]">85K</div>
            <p className="text-[1.2vw] text-white font-medium mt-2">Monthly Active Users</p>
            <p className="text-[0.9vw] text-[#A0A0A0] mt-1">DAU/MAU ratio: 42%</p>
            <div className="mt-4 flex items-center gap-1 text-[#10B981] text-[0.9vw]">
              <span>&#9650;</span>
              <span className="font-bold">+28% MoM</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#06B6D4]/20 to-[#06B6D4]/5 border border-[#06B6D4]/30 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="text-[4vw] font-black text-[#06B6D4]">18 min</div>
            <p className="text-[1.2vw] text-white font-medium mt-2">Avg Session Duration</p>
            <p className="text-[0.9vw] text-[#A0A0A0] mt-1">Above industry benchmark</p>
            <div className="mt-4 flex items-center gap-1 text-[#10B981] text-[0.9vw]">
              <span>&#9650;</span>
              <span className="font-bold">+15% MoM</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Engagement Stats */}
        <div className="mt-[3vh] grid grid-cols-4 gap-[2vw]">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-white">4.2</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Sessions / User / Day</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-white">72%</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Day 7 Retention</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-white">12K+</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Content Posts Daily</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-white">4.6</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">App Store Rating</p>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="mt-[3vh] bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
          <div className="flex items-end justify-between gap-[1vw] h-[12vh]">
            {["M1", "M2", "M3", "M4", "M5", "M6"].map((m, i) => {
              const heights = [15, 25, 40, 55, 72, 85];
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#7B2FBE] to-[#E91E8C] rounded-t-sm"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-[0.8vw] text-[#A0A0A0]">{m}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[0.9vw] text-[#A0A0A0] mt-2 text-center">Monthly Active User Growth (000s)</p>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        06 / 15
      </div>
    </div>
  );
}
