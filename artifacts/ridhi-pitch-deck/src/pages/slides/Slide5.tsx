export default function Slide5() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] rounded-full bg-[#E91E8C] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">Market Opportunity</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            India's Social Media Market is a $50B+ Opportunity
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[4vw]">
          {/* Left: Stats */}
          <div className="space-y-[3vh]">
            <div className="bg-gradient-to-r from-[#7B2FBE]/20 to-transparent border border-[#7B2FBE]/30 rounded-xl p-[2vw]">
              <div className="text-[3vw] font-black text-[#7B2FBE]">1.4B</div>
              <p className="text-[1.2vw] text-white font-medium">Total Population</p>
              <p className="text-[0.9vw] text-[#A0A0A0]">World's most populous nation, 65% under 35</p>
            </div>

            <div className="bg-gradient-to-r from-[#E91E8C]/20 to-transparent border border-[#E91E8C]/30 rounded-xl p-[2vw]">
              <div className="text-[3vw] font-black text-[#E91E8C]">900M</div>
              <p className="text-[1.2vw] text-white font-medium">Internet Users</p>
              <p className="text-[0.9vw] text-[#A0A0A0]">Second largest internet market globally</p>
            </div>

            <div className="bg-gradient-to-r from-[#06B6D4]/20 to-transparent border border-[#06B6D4]/30 rounded-xl p-[2vw]">
              <div className="text-[3vw] font-black text-[#06B6D4]">600M</div>
              <p className="text-[1.2vw] text-white font-medium">Regional Language Users</p>
              <p className="text-[0.9vw] text-[#A0A0A0]">90% prefer content in their native language</p>
            </div>
          </div>

          {/* Right: Chart-like visual */}
          <div className="flex flex-col justify-center">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[3vw]">
              <h3 className="text-[1.5vw] font-bold text-white mb-[3vh]">India Social Media TAM</h3>

              <div className="space-y-[2vh]">
                <div>
                  <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                    <span>Social Media Market</span>
                    <span className="font-bold">$12B</span>
                  </div>
                  <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B2FBE] rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                    <span>Online Dating</span>
                    <span className="font-bold">$3B</span>
                  </div>
                  <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E91E8C] rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                    <span>Creator Economy</span>
                    <span className="font-bold">$8B</span>
                  </div>
                  <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                    <span>Live Streaming / Gaming</span>
                    <span className="font-bold">$5B</span>
                  </div>
                  <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#06B6D4] rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[1vw] text-white mb-1">
                    <span>In-App Commerce</span>
                    <span className="font-bold">$22B</span>
                  </div>
                  <div className="h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-[3vh] pt-[2vh] border-t border-white/10">
                <div className="flex items-center justify-between text-[1.2vw] text-white font-bold">
                  <span>Total Addressable Market</span>
                  <span className="text-[#7B2FBE]">$50B+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        05 / 15
      </div>
    </div>
  );
}
