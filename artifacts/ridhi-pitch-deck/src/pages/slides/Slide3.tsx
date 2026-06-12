export default function Slide3() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">The Solution</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            One Super-App for India's Full Digital Lifestyle
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[3vw]">
          {/* Left: Features */}
          <div className="space-y-[2vh]">
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw]">
              <div className="w-10 h-10 rounded-lg bg-[#7B2FBE]/20 flex items-center justify-center shrink-0">
                <span className="text-[#7B2FBE] text-xl">&#128247;</span>
              </div>
              <div>
                <h4 className="text-[1.2vw] font-bold text-white">Social Feed & Stories</h4>
                <p className="text-[1vw] text-[#A0A0A0]">Photo, video, text posts with regional language support</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw]">
              <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/20 flex items-center justify-center shrink-0">
                <span className="text-[#E91E8C] text-xl">&#128150;</span>
              </div>
              <div>
                <h4 className="text-[1.2vw] font-bold text-white">Dating & Matching</h4>
                <p className="text-[1vw] text-[#A0A0A0]">Tinder-style swipe with India-safe privacy controls</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw]">
              <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center shrink-0">
                <span className="text-[#06B6D4] text-xl">&#127909;</span>
              </div>
              <div>
                <h4 className="text-[1.2vw] font-bold text-white">Vertical Reels</h4>
                <p className="text-[1vw] text-[#A0A0A0]">TikTok-style short-form video with local trends</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw]">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                <span className="text-[#F59E0B] text-xl">&#127897;</span>
              </div>
              <div>
                <h4 className="text-[1.2vw] font-bold text-white">Live Streaming</h4>
                <p className="text-[1vw] text-[#A0A0A0]">Gifts, PK battles, audio rooms, podcast channels</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw]">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center shrink-0">
                <span className="text-[#10B981] text-xl">&#127880;</span>
              </div>
              <div>
                <h4 className="text-[1.2vw] font-bold text-white">Brand Marketplace</h4>
                <p className="text-[1vw] text-[#A0A0A0]">Built-in creator-brand marketplace, native ads, coin economy</p>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative flex items-center justify-center">
            <div className="w-[80%] aspect-[9/16] bg-gradient-to-br from-[#1A0A2E] to-[#2A0A1E] border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(123,47,190,0.2)] flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(123,47,190,0.5)]">
                  <span className="text-white font-black text-5xl">R</span>
                </div>
                <p className="text-[2vw] font-bold text-white">Ridhi</p>
                <p className="text-[1vw] text-[#A0A0A0] mt-2">13 Languages • 1 App</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-[0.8vw] text-[#A0A0A0]">
                  <span className="px-2 py-1 bg-white/10 rounded">Hindi</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Tamil</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Telugu</span>
                  <span className="px-2 py-1 bg-white/10 rounded">+10</span>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute top-[10%] right-[5%] bg-[#E91E8C]/20 border border-[#E91E8C]/40 rounded-lg px-3 py-2 text-[0.8vw] text-[#E91E8C] font-semibold">
              #1 in Regional
            </div>
            <div className="absolute bottom-[20%] left-[5%] bg-[#7B2FBE]/20 border border-[#7B2FBE]/40 rounded-lg px-3 py-2 text-[0.8vw] text-[#7B2FBE] font-semibold">
              Super-App
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        03 / 15
      </div>
    </div>
  );
}
