export default function Slide14() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#E91E8C] opacity-[0.08] blur-[100px]" />
      <div className="absolute bottom-[5%] left-[10%] w-[30%] h-[30%] rounded-full bg-[#7B2FBE] opacity-[0.08] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">The Ask</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Seeking $2.5M Seed Round
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[4vw]">
          {/* Left: Use of Funds */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[3vw] flex flex-col">
            <h3 className="text-[1.3vw] font-bold text-white mb-[3vh]">Use of Funds</h3>

            <div className="space-y-[2vh] flex-1">
              <div>
                <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7B2FBE]" />
                    Product &amp; Engineering
                  </span>
                  <span className="font-bold">40%</span>
                </div>
                <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7B2FBE] rounded-full" style={{ width: '40%' }} />
                </div>
                <p className="text-[0.8vw] text-[#A0A0A0] mt-1">₹1.0Cr — Team expansion, feature development, AI</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#E91E8C]" />
                    Marketing &amp; Growth
                  </span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E91E8C] rounded-full" style={{ width: '30%' }} />
                </div>
                <p className="text-[0.8vw] text-[#A0A0A0] mt-1">₹75L — User acquisition, influencer campaigns, brand</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    Infrastructure &amp; Operations
                  </span>
                  <span className="font-bold">20%</span>
                </div>
                <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '20%' }} />
                </div>
                <p className="text-[0.8vw] text-[#A0A0A0] mt-1">₹50L — Cloud, servers, compliance, moderation</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    Working Capital
                  </span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: '10%' }} />
                </div>
                <p className="text-[0.8vw] text-[#A0A0A0] mt-1">₹25L — Creator payouts, emergency reserve</p>
              </div>
            </div>
          </div>

          {/* Right: Investment Details */}
          <div className="space-y-[2.5vh]">
            <div className="bg-gradient-to-br from-[#7B2FBE]/20 to-[#E91E8C]/20 border border-[#7B2FBE]/30 rounded-2xl p-[2.5vw] text-center">
              <p className="text-[1vw] text-[#A0A0A0] mb-2">Seed Round</p>
              <div className="text-[5vw] font-black text-white leading-none">₹2.5Cr</div>
              <p className="text-[1.2vw] text-[#E91E8C] font-medium mt-2">~$300K USD</p>
              <div className="w-24 h-[2px] bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] mx-auto my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[1.5vw] font-bold text-white">15%</p>
                  <p className="text-[0.8vw] text-[#A0A0A0]">Equity Offered</p>
                </div>
                <div>
                  <p className="text-[1.5vw] font-bold text-white">18 mo</p>
                  <p className="text-[0.8vw] text-[#A0A0A0]">Runway</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.1vw] font-bold text-white mb-3">Investment Terms</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[0.95vw]">
                  <span className="text-[#A0A0A0]">Instrument</span>
                  <span className="text-white font-medium">SAFE / Equity</span>
                </div>
                <div className="flex items-center justify-between text-[0.95vw]">
                  <span className="text-[#A0A0A0]">Pre-Money Valuation</span>
                  <span className="text-white font-medium">₹14Cr (~$1.7M)</span>
                </div>
                <div className="flex items-center justify-between text-[0.95vw]">
                  <span className="text-[#A0A0A0]">Post-Money Valuation</span>
                  <span className="text-white font-medium">₹16.5Cr (~$2.0M)</span>
                </div>
                <div className="flex items-center justify-between text-[0.95vw]">
                  <span className="text-[#A0A0A0]">Minimum Check</span>
                  <span className="text-white font-medium">₹25L (~$30K)</span>
                </div>
                <div className="flex items-center justify-between text-[0.95vw]">
                  <span className="text-[#A0A0A0]">Next Milestone</span>
                  <span className="text-[#10B981] font-medium">Series A at 1M MAU</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/5 border border-[#10B981]/30 rounded-xl p-[1.5vw]">
              <p className="text-[1vw] text-white font-medium">
                <span className="text-[#10B981]">&#9654;</span> Targeting 1M MAU by Month 9 for Series A readiness
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        14 / 15
      </div>
    </div>
  );
}
