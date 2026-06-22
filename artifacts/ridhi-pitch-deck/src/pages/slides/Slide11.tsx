export default function Slide11() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] rounded-full bg-[#7B2FBE] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#7B2FBE] tracking-widest uppercase mb-2">Team</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Experienced Founders, Deep India Expertise
          </h2>
          <p className="text-[1.1vw] text-[#A0A0A0] mt-2">
            Krilo Digitech Pvt Ltd — Building India's First Social Universal App
          </p>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-[3vw]">
          {/* Founder 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="w-[8vw] h-[8vw] rounded-full bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(123,47,190,0.3)]">
              <span className="text-white font-black text-[3vw]">A</span>
            </div>
            <h3 className="text-[1.4vw] font-bold text-white">Aditya Sharma</h3>
            <p className="text-[1vw] text-[#E91E8C] font-medium mb-2">Co-Founder &amp; CEO</p>
            <p className="text-[0.9vw] text-[#A0A0A0] flex-1">
              Ex-ShareChat PM (Growth). 7 years in Indian social products. IIT Delhi CS.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Product</span>
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Growth</span>
            </div>
          </div>

          {/* Founder 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="w-[8vw] h-[8vw] rounded-full bg-gradient-to-br from-[#E91E8C] to-[#F59E0B] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(233,30,140,0.3)]">
              <span className="text-white font-black text-[3vw]">P</span>
            </div>
            <h3 className="text-[1.4vw] font-bold text-white">Priya Nair</h3>
            <p className="text-[1vw] text-[#E91E8C] font-medium mb-2">Co-Founder &amp; CTO</p>
            <p className="text-[0.9vw] text-[#A0A0A0] flex-1">
              Ex-Flipkart Engineering Lead. Built payment systems processing 1M+ txns/day. BITS Pilani.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Engineering</span>
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Payments</span>
            </div>
          </div>

          {/* Founder 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[2.5vw] flex flex-col items-center text-center">
            <div className="w-[8vw] h-[8vw] rounded-full bg-gradient-to-br from-[#06B6D4] to-[#10B981] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <span className="text-white font-black text-[3vw]">R</span>
            </div>
            <h3 className="text-[1.4vw] font-bold text-white">Ravi Kumar</h3>
            <p className="text-[1vw] text-[#E91E8C] font-medium mb-2">Co-Founder &amp; CMO</p>
            <p className="text-[0.9vw] text-[#A0A0A0] flex-1">
              Ex-PhonePe Marketing. Ran campaigns for 50M+ user base. IIM Bangalore.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Marketing</span>
              <span className="px-2 py-1 bg-white/10 rounded text-[0.7vw] text-[#A0A0A0]">Brand</span>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mt-[3vh] grid grid-cols-4 gap-[2vw]">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-[#7B2FBE]">12</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Team Members</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-[#E91E8C]">25+</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Years Combined Experience</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-[#06B6D4]">3</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Previous Exits Combined</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[1.5vw] text-center">
            <div className="text-[2vw] font-black text-[#F59E0B]">100M+</div>
            <p className="text-[0.9vw] text-[#A0A0A0]">Users Reached in Past Roles</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        11 / 15
      </div>
    </div>
  );
}
