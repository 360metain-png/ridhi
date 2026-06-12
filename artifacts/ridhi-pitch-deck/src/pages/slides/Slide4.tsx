export default function Slide4() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[5%] right-[5%] w-[35%] h-[35%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[3vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">Product</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Feature-Packed, Purpose-Built for India
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-[2vw]">
          {/* Card 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#128247;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Home Feed</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Stories, posts, regional content, trending hashtags</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#127909;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Reels</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Full-screen vertical short video with duets, stitch</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#128150;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Dating</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Swipe matching, chat, video calls, privacy-first</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#128172;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Chat</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Text, voice, image, GIF, group chats, chatrooms</p>
          </div>
          {/* Card 5 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#127897;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Live Streaming</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Live gifts, PK battles, leaderboards, missions</p>
          </div>
          {/* Card 6 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#127911;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Podcasts</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Audio rooms, podcast channels, host profiles</p>
          </div>
          {/* Card 7 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#127942;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">VIP &amp; Coins</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">4 VIP tiers, coin wallet, recharge, subscriptions</p>
          </div>
          {/* Card 8 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="text-[2.5vw] mb-2">&#128200;</div>
            <h4 className="text-[1.1vw] font-bold text-white mb-1">Creator Dashboard</h4>
            <p className="text-[0.9vw] text-[#A0A0A0]">Analytics, earnings, withdrawals, brand deals</p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-[2vh] flex items-center justify-center gap-4">
          <div className="bg-[#7B2FBE]/20 border border-[#7B2FBE]/40 rounded-full px-4 py-2 text-[0.9vw] text-[#7B2FBE] font-medium">
            13 Indian Languages
          </div>
          <div className="bg-[#E91E8C]/20 border border-[#E91E8C]/40 rounded-full px-4 py-2 text-[0.9vw] text-[#E91E8C] font-medium">
            Dark &amp; Light Mode
          </div>
          <div className="bg-[#10B981]/20 border border-[#10B981]/40 rounded-full px-4 py-2 text-[0.9vw] text-[#10B981] font-medium">
            AI Assistant Built-in
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        04 / 15
      </div>
    </div>
  );
}
