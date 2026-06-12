export default function Slide8() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">Business Model</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            The Indian Creator Economy Engine
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[4vw]">
          {/* Left: Flywheel */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[40vw]">
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12vw] h-[12vw] rounded-full bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center shadow-[0_0_60px_rgba(123,47,190,0.4)] z-10">
                <div className="text-center">
                  <p className="text-[1.2vw] font-bold text-white">Ridhi</p>
                  <p className="text-[0.8vw] text-white/80">Flywheel</p>
                </div>
              </div>

              {/* Segments */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#7B2FBE]/20 border border-[#7B2FBE]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#7B2FBE] text-2xl">&#128100;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Users</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">Engage &amp; consume</p>
              </div>

              <div className="absolute top-[25%] right-[5%] w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#E91E8C]/20 border border-[#E91E8C]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#E91E8C] text-2xl">&#127912;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Creators</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">Produce content</p>
              </div>

              <div className="absolute bottom-[25%] right-[5%] w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#F59E0B] text-2xl">&#127880;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Brands</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">Advertise &amp; sponsor</p>
              </div>

              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#10B981] text-2xl">&#128176;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Revenue</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">Funds growth</p>
              </div>

              <div className="absolute bottom-[25%] left-[5%] w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#06B6D4] text-2xl">&#128640;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Growth</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">More users &amp; creators</p>
              </div>

              <div className="absolute top-[25%] left-[5%] w-[10vw] text-center">
                <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#8B5CF6] text-2xl">&#127919;</span>
                </div>
                <p className="text-[0.9vw] text-white font-medium">Features</p>
                <p className="text-[0.7vw] text-[#A0A0A0]">Better product</p>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-[2.5vh]">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-2">User Growth Loop</h3>
              <p className="text-[1vw] text-[#A0A0A0]">
                Free tier drives viral adoption. Regional content creates organic sharing. Dating features create network effects.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-2">Creator Incentives</h3>
              <p className="text-[1vw] text-[#A0A0A0]">
                70% revenue share on gifts. Creator dashboard with analytics. Monthly payouts. Brand deal marketplace access.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-2">Brand Value</h3>
              <p className="text-[1vw] text-[#A0A0A0]">
                Direct access to India's youth demographic. Hyper-local targeting by city, language, interest. Performance tracking.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-2">Unit Economics</h3>
              <p className="text-[1vw] text-[#A0A0A0]">
                CAC: ₹45 (organic + referral). LTV: ₹3,200 (VIP + coins + gifts). LTV/CAC ratio: <span className="text-[#10B981] font-bold">71x</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        08 / 15
      </div>
    </div>
  );
}
