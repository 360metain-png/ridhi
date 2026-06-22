export default function Slide7() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] rounded-full bg-[#E91E8C] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">Monetization</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Multiple Revenue Streams = Sustainable Growth
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-[2.5vw]">
          {/* Revenue Stream 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#7B2FBE]/20 flex items-center justify-center mb-3">
              <span className="text-[#7B2FBE] text-xl font-bold">&#127942;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">VIP Subscriptions</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              4 tiers: Silver, Gold, Platinum, Diamond Elite. Weekly, monthly, yearly billing. Starting at ₹49/week.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#7B2FBE]">₹12L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">MRR (Monthly Recurring Revenue)</p>
            </div>
          </div>

          {/* Revenue Stream 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#E91E8C]/20 flex items-center justify-center mb-3">
              <span className="text-[#E91E8C] text-xl font-bold">&#127880;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">Coin Economy</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              In-app currency for gifts, boosts, premium features. Recharge packs from ₹49 to ₹4,999. Missions, ads, and referrals.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#E91E8C]">₹8L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">Monthly Coin Revenue</p>
            </div>
          </div>

          {/* Revenue Stream 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center mb-3">
              <span className="text-[#F59E0B] text-xl font-bold">&#127897;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">Live Gifts</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              Virtual gifts during live streams. Revenue split with creators. 50+ gift types from 10 coins to 10,000 coins.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#F59E0B]">₹5L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">Monthly Gift Revenue</p>
            </div>
          </div>

          {/* Revenue Stream 4 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center mb-3">
              <span className="text-[#06B6D4] text-xl font-bold">&#128200;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">Ad Platform</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              Business ads, special client ads, commercial banners, promotions. Self-serve campaign manager with targeting.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#06B6D4]">₹3L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">Monthly Ad Revenue</p>
            </div>
          </div>

          {/* Revenue Stream 5 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center mb-3">
              <span className="text-[#10B981] text-xl font-bold">&#128 handshake;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">Brand Marketplace</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              Creator-brand deals, lead forms, post deals, brand registration. 10% platform fee on all transactions.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#10B981]">₹2L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">Monthly Marketplace Revenue</p>
            </div>
          </div>

          {/* Revenue Stream 6 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center mb-3">
              <span className="text-[#8B5CF6] text-xl font-bold">&#128218;</span>
            </div>
            <h3 className="text-[1.3vw] font-bold text-white mb-2">Creator Plans</h3>
            <p className="text-[1vw] text-[#A0A0A0] flex-1">
              3 creator tiers: Basic, Pro, Elite. Analytics, earnings dashboard, priority support, withdrawal options.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[1.5vw] font-bold text-[#8B5CF6]">₹1L</div>
              <p className="text-[0.8vw] text-[#A0A0A0]">Monthly Creator Revenue</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="mt-[2vh] bg-gradient-to-r from-[#7B2FBE]/20 to-[#E91E8C]/20 border border-[#7B2FBE]/30 rounded-xl p-[2vw] flex items-center justify-between">
          <div>
            <p className="text-[1vw] text-[#A0A0A0]">Current Monthly Revenue</p>
            <div className="text-[2.5vw] font-black text-white">₹31L / ~$37K</div>
          </div>
          <div className="text-right">
            <p className="text-[1vw] text-[#A0A0A0]">Projected ARR (Year 2)</p>
            <div className="text-[2.5vw] font-black text-[#E91E8C]">₹2.4Cr / ~$290K</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        07 / 15
      </div>
    </div>
  );
}
