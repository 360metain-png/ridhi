export default function Slide12() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[5%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#E91E8C] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">Go-to-Market</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Aggressive Growth Strategy for 12-Month Scale
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[3vw]">
          {/* Left: Timeline */}
          <div className="space-y-[2vh]">
            {/* Phase 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#7B2FBE] flex items-center justify-center text-white font-bold text-[1vw] shrink-0">
                  1
                </div>
                <div className="w-[2px] flex-1 bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C] min-h-[2vh]" />
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.9vw] font-bold text-[#7B2FBE]">Months 1-3</span>
                  <span className="text-[0.8vw] text-[#A0A0A0]">Foundation</span>
                </div>
                <p className="text-[1vw] text-[#A0A0A0]">
                  Product launch on Android. 5 metro cities (Delhi, Mumbai, Bangalore, Hyderabad, Chennai). Influencer seeding. 100K downloads target.
                </p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#E91E8C] flex items-center justify-center text-white font-bold text-[1vw] shrink-0">
                  2
                </div>
                <div className="w-[2px] flex-1 bg-gradient-to-b from-[#E91E8C] to-[#F59E0B] min-h-[2vh]" />
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.9vw] font-bold text-[#E91E8C]">Months 4-6</span>
                  <span className="text-[0.8vw] text-[#A0A0A0]">Expansion</span>
                </div>
                <p className="text-[1vw] text-[#A0A0A0]">
                  iOS launch. 10 more cities. Live streaming + dating go viral. 500K downloads. First creator payouts. Brand partnerships.
                </p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white font-bold text-[1vw] shrink-0">
                  3
                </div>
                <div className="w-[2px] flex-1 bg-gradient-to-b from-[#F59E0B] to-[#10B981] min-h-[2vh]" />
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.9vw] font-bold text-[#F59E0B]">Months 7-9</span>
                  <span className="text-[0.8vw] text-[#A0A0A0]">Scale</span>
                </div>
                <p className="text-[1vw] text-[#A0A0A0]">
                  Pan-India. Tier 2/3 cities. 1.5M downloads. Revenue-positive. 10K creators. 50+ brand partnerships.
                </p>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-[1vw] shrink-0">
                  4
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.9vw] font-bold text-[#10B981]">Months 10-12</span>
                  <span className="text-[0.8vw] text-[#A0A0A0]">Domination</span>
                </div>
                <p className="text-[1vw] text-[#A0A0A0]">
                  3M downloads. Series A ready. 50K creators. 200+ brand partners. ₹1Cr+ monthly revenue. International expansion plan.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Channels & KPIs */}
          <div className="space-y-[2vh]">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3">Growth Channels</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7B2FBE]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#7B2FBE] text-[0.9vw]">&#128227;</span>
                  </div>
                  <div>
                    <p className="text-[1vw] text-white font-medium">Influencer Seeding</p>
                    <p className="text-[0.8vw] text-[#A0A0A0]">500 micro-influencers in first 3 months</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E91E8C]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#E91E8C] text-[0.9vw]">&#128241;</span>
                  </div>
                  <div>
                    <p className="text-[1vw] text-white font-medium">Referral Program</p>
                    <p className="text-[0.8vw] text-[#A0A0A0]">Coins for every successful referral</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#F59E0B] text-[0.9vw]">&#127775;</span>
                  </div>
                  <div>
                    <p className="text-[1vw] text-white font-medium">Content Challenges</p>
                    <p className="text-[0.8vw] text-[#A0A0A0]">Weekly trending hashtag contests</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#06B6D4] text-[0.9vw]">&#128187;</span>
                  </div>
                  <div>
                    <p className="text-[1vw] text-white font-medium">Performance Marketing</p>
                    <p className="text-[0.8vw] text-[#A0A0A0]">Google UAC, Meta, ShareChat ads</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3">12-Month Targets</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-[2vw] font-black text-[#7B2FBE]">3M</div>
                  <p className="text-[0.9vw] text-[#A0A0A0]">Downloads</p>
                </div>
                <div className="text-center">
                  <div className="text-[2vw] font-black text-[#E91E8C]">1M</div>
                  <p className="text-[0.9vw] text-[#A0A0A0]">MAU</p>
                </div>
                <div className="text-center">
                  <div className="text-[2vw] font-black text-[#F59E0B]">₹1Cr</div>
                  <p className="text-[0.9vw] text-[#A0A0A0]">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-[2vw] font-black text-[#10B981]">50K</div>
                  <p className="text-[0.9vw] text-[#A0A0A0]">Active Creators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        12 / 15
      </div>
    </div>
  );
}
