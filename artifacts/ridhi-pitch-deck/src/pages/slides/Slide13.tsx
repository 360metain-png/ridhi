export default function Slide13() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">Financials</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Revenue Projections &amp; Unit Economics
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[3vw]">
          {/* Left: Revenue Chart */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[3vw] flex flex-col">
            <h3 className="text-[1.2vw] font-bold text-white mb-[3vh]">Projected Revenue (Monthly, ₹ Lakhs)</h3>
            <div className="flex-1 flex items-end justify-between gap-[1vw]">
              {[
                { month: "M1", value: 1.5, color: "#7B2FBE" },
                { month: "M3", value: 3.2, color: "#7B2FBE" },
                { month: "M6", value: 8.5, color: "#E91E8C" },
                { month: "M9", value: 15.0, color: "#E91E8C" },
                { month: "M12", value: 25.0, color: "#F59E0B" },
                { month: "Y2", value: 75.0, color: "#10B981" },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[0.9vw] font-bold text-white">{bar.value}L</div>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${(bar.value / 75) * 35}vh`,
                      backgroundColor: bar.color,
                      opacity: 0.85,
                    }}
                  />
                  <span className="text-[0.8vw] text-[#A0A0A0]">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Financial Table */}
          <div className="space-y-[2vh]">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-[1vw] text-[#A0A0A0]">Customer Acquisition Cost (CAC)</span>
                  <span className="text-[1vw] font-bold text-white">₹45</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-[1vw] text-[#A0A0A0]">Lifetime Value (LTV)</span>
                  <span className="text-[1vw] font-bold text-[#10B981]">₹3,200</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-[1vw] text-[#A0A0A0]">LTV / CAC Ratio</span>
                  <span className="text-[1vw] font-bold text-[#10B981]">71x</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-[1vw] text-[#A0A0A0]">Gross Margin</span>
                  <span className="text-[1vw] font-bold text-white">68%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-[1vw] text-[#A0A0A0]">Monthly Burn Rate</span>
                  <span className="text-[1vw] font-bold text-white">₹8L</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[1vw] text-[#A0A0A0]">Runway (with seed)</span>
                  <span className="text-[1vw] font-bold text-[#F59E0B]">18 months</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3">Revenue Breakdown (Year 1)</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#7B2FBE]" />
                  <span className="text-[0.95vw] text-[#A0A0A0] flex-1">VIP Subscriptions</span>
                  <span className="text-[0.95vw] font-bold text-white">38%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#E91E8C]" />
                  <span className="text-[0.95vw] text-[#A0A0A0] flex-1">Coin Economy</span>
                  <span className="text-[0.95vw] font-bold text-white">25%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="text-[0.95vw] text-[#A0A0A0] flex-1">Live Gifts</span>
                  <span className="text-[0.95vw] font-bold text-white">16%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
                  <span className="text-[0.95vw] text-[#A0A0A0] flex-1">Ads &amp; Marketplace</span>
                  <span className="text-[0.95vw] font-bold text-white">15%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-[0.95vw] text-[#A0A0A0] flex-1">Creator Plans</span>
                  <span className="text-[0.95vw] font-bold text-white">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        13 / 15
      </div>
    </div>
  );
}
