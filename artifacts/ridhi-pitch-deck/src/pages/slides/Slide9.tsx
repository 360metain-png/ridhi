export default function Slide9() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">Competitive Landscape</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Ridhi vs. The Competition: Why We Win
          </h2>
        </div>

        <div className="flex-1">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-0">
              <div className="p-[1.5vw] bg-white/[0.05] border-b border-r border-white/10">
                <p className="text-[1vw] font-bold text-white">Feature</p>
              </div>
              <div className="p-[1.5vw] bg-[#7B2FBE]/20 border-b border-r border-white/10 text-center">
                <p className="text-[1vw] font-bold text-[#7B2FBE]">Ridhi</p>
              </div>
              <div className="p-[1.5vw] bg-white/[0.05] border-b border-r border-white/10 text-center">
                <p className="text-[1vw] font-bold text-[#A0A0A0]">ShareChat</p>
              </div>
              <div className="p-[1.5vw] bg-white/[0.05] border-b border-r border-white/10 text-center">
                <p className="text-[1vw] font-bold text-[#A0A0A0]">Instagram</p>
              </div>
              <div className="p-[1.5vw] bg-white/[0.05] border-b border-white/10 text-center">
                <p className="text-[1vw] font-bold text-[#A0A0A0]">Tinder</p>
              </div>
            </div>

            {/* Data Rows */}
            {[
              { feature: "Regional Languages", ridhi: "13", sc: "15", ig: "Limited", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "Social Feed", ridhi: "&#10003;", sc: "&#10003;", ig: "&#10003;", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#10B981]", igColor: "text-[#10B981]", tdColor: "text-[#A0A0A0]" },
              { feature: "Short Video (Reels)", ridhi: "&#10003;", sc: "&#10003;", ig: "&#10003;", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#10B981]", igColor: "text-[#10B981]", tdColor: "text-[#A0A0A0]" },
              { feature: "Dating / Matching", ridhi: "&#10003;", sc: "No", ig: "No", td: "&#10003;", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#10B981]" },
              { feature: "Live Streaming", ridhi: "&#10003;", sc: "&#10003;", ig: "Limited", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#10B981]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "Audio/Podcasts", ridhi: "&#10003;", sc: "No", ig: "No", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "Creator Monetization", ridhi: "&#10003;", sc: "Limited", ig: "Limited", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "Brand Marketplace", ridhi: "&#10003;", sc: "No", ig: "No", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "Coin Economy", ridhi: "&#10003;", sc: "&#10003;", ig: "No", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#10B981]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
              { feature: "AI Assistant", ridhi: "&#10003;", sc: "No", ig: "No", td: "No", ridhiColor: "text-[#10B981]", scColor: "text-[#A0A0A0]", igColor: "text-[#A0A0A0]", tdColor: "text-[#A0A0A0]" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-5 gap-0">
                <div className="p-[1.2vw] bg-white/[0.02] border-b border-r border-white/10">
                  <p className="text-[0.95vw] text-white">{row.feature}</p>
                </div>
                <div className={`p-[1.2vw] bg-[#7B2FBE]/10 border-b border-r border-white/10 text-center ${row.ridhiColor}`}>
                  <p className="text-[0.95vw] font-bold">{row.ridhi}</p>
                </div>
                <div className={`p-[1.2vw] bg-white/[0.02] border-b border-r border-white/10 text-center ${row.scColor}`}>
                  <p className="text-[0.95vw]">{row.sc}</p>
                </div>
                <div className={`p-[1.2vw] bg-white/[0.02] border-b border-r border-white/10 text-center ${row.igColor}`}>
                  <p className="text-[0.95vw]">{row.ig}</p>
                </div>
                <div className={`p-[1.2vw] bg-white/[0.02] border-b border-white/10 text-center ${row.tdColor}`}>
                  <p className="text-[0.95vw]">{row.td}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom insight */}
          <div className="mt-[2vh] flex items-center gap-4">
            <div className="bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg px-4 py-2 text-[0.9vw] text-[#10B981] font-medium">
              10/10 features covered
            </div>
            <div className="bg-[#E91E8C]/20 border border-[#E91E8C]/40 rounded-lg px-4 py-2 text-[0.9vw] text-[#E91E8C] font-medium">
              Only all-in-one super-app
            </div>
            <div className="bg-[#7B2FBE]/20 border border-[#7B2FBE]/40 rounded-lg px-4 py-2 text-[0.9vw] text-[#7B2FBE] font-medium">
              India-first design
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        09 / 15
      </div>
    </div>
  );
}
