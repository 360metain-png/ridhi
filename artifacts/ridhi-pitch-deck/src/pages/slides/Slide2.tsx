export default function Slide2() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[15%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#E91E8C] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        {/* Title */}
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">
            The Problem
          </p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            India's Social Platforms Are Not Built for Indians
          </h2>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-3 gap-[3vw]">
          {/* Column 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#E91E8C]/20 flex items-center justify-center mb-4">
              <span className="text-[#E91E8C] text-2xl font-bold">01</span>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-3">Language Barrier</h3>
            <p className="text-[1.1vw] text-[#A0A0A0] leading-relaxed flex-1">
              90% of India's internet users prefer regional languages. Yet global platforms are English-first, leaving 600M+ users underserved.
            </p>
            <div className="mt-4 text-[2vw] font-black text-[#E91E8C]">600M+</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Regional language users</p>
          </div>

          {/* Column 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#7B2FBE]/20 flex items-center justify-center mb-4">
              <span className="text-[#7B2FBE] text-2xl font-bold">02</span>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-3">Fragmented Experience</h3>
            <p className="text-[1.1vw] text-[#A0A0A0] leading-relaxed flex-1">
              Users need 4+ apps for social, dating, entertainment, and live streaming. No single app serves India's full digital lifestyle.
            </p>
            <div className="mt-4 text-[2vw] font-black text-[#7B2FBE]">4+</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Apps per user today</p>
          </div>

          {/* Column 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center mb-4">
              <span className="text-[#F59E0B] text-2xl font-bold">03</span>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-3">Creator Monetization</h3>
            <p className="text-[1.1vw] text-[#A0A0A0] leading-relaxed flex-1">
              Indian creators earn 1/10th of global averages. Platforms lack India-specific monetization: coins, subscriptions, live gifts, brand deals.
            </p>
            <div className="mt-4 text-[2vw] font-black text-[#F59E0B]">1/10th</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Average creator earnings vs. global</p>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="mt-[3vh] bg-gradient-to-r from-[#7B2FBE]/20 to-[#E91E8C]/20 border border-[#7B2FBE]/30 rounded-xl px-[3vw] py-[2vh]">
          <p className="text-[1.2vw] text-white font-medium">
            <span className="text-[#E91E8C]">&#9654;</span> The gap between India's digital potential and platform reality is a $50B+ opportunity
          </p>
        </div>
      </div>

      {/* Slide number */}
      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        02 / 15
      </div>
    </div>
  );
}
