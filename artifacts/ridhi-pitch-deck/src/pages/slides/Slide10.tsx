export default function Slide10() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#7B2FBE] to-[#E91E8C]" />
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#E91E8C] opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col px-[7vw] py-[6vh]">
        <div className="mb-[4vh]">
          <p className="text-[1vw] font-semibold text-[#E91E8C] tracking-widest uppercase mb-2">Technology</p>
          <h2
            className="text-[3.5vw] font-bold text-white leading-tight"
            style={{ fontFamily: 'var(--font-display-family)' }}
          >
            Built on Modern, Scalable Architecture
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-[3vw]">
          {/* Left: Tech Stack */}
          <div className="space-y-[2vh]">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-[#7B2FBE]">&#128241;</span> Mobile
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Expo", "React Native", "TypeScript", "Expo Router", "AsyncStorage"].map((t) => (
                  <span key={t} className="px-3 py-1 bg-[#7B2FBE]/20 border border-[#7B2FBE]/30 rounded-full text-[0.85vw] text-[#7B2FBE]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-[#E91E8C]">&#128187;</span> Backend
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Express 5", "PostgreSQL", "Drizzle ORM", "Razorpay", "MSG91"].map((t) => (
                  <span key={t} className="px-3 py-1 bg-[#E91E8C]/20 border border-[#E91E8C]/30 rounded-full text-[0.85vw] text-[#E91E8C]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-[#06B6D4]">&#127918;</span> Admin Dashboard
              </h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Vite", "Tailwind CSS", "Recharts", "TanStack Query"].map((t) => (
                  <span key={t} className="px-3 py-1 bg-[#06B6D4]/20 border border-[#06B6D4]/30 rounded-full text-[0.85vw] text-[#06B6D4]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-[2vw]">
              <h3 className="text-[1.2vw] font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-[#F59E0B]">&#129302;</span> AI &amp; Intelligence
              </h3>
              <div className="flex flex-wrap gap-2">
                {["AI Assistant", "Content Recommendations", "Smart Moderation", "Analytics"].map((t) => (
                  <span key={t} className="px-3 py-1 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-full text-[0.85vw] text-[#F59E0B]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Architecture Diagram */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-[3vw] flex flex-col">
            <h3 className="text-[1.3vw] font-bold text-white mb-[3vh]">System Architecture</h3>

            <div className="flex-1 flex flex-col items-center justify-center gap-[2vh]">
              {/* Users */}
              <div className="w-[70%] bg-[#7B2FBE]/20 border border-[#7B2FBE]/40 rounded-xl p-[1.5vw] text-center">
                <p className="text-[1vw] font-bold text-[#7B2FBE]">Users (iOS / Android / Web)</p>
                <p className="text-[0.8vw] text-[#A0A0A0]">Expo + React Native</p>
              </div>

              <div className="text-[#A0A0A0] text-[1.5vw]">&#9660;</div>

              {/* API Layer */}
              <div className="w-[80%] bg-[#E91E8C]/20 border border-[#E91E8C]/40 rounded-xl p-[1.5vw] text-center">
                <p className="text-[1vw] font-bold text-[#E91E8C]">API Gateway + Express Server</p>
                <p className="text-[0.8vw] text-[#A0A0A0]">Auth, Payments, Analytics, Content</p>
              </div>

              <div className="text-[#A0A0A0] text-[1.5vw]">&#9660;</div>

              {/* Services */}
              <div className="w-[90%] grid grid-cols-3 gap-[1vw]">
                <div className="bg-[#06B6D4]/20 border border-[#06B6D4]/40 rounded-lg p-[1vw] text-center">
                  <p className="text-[0.9vw] font-bold text-[#06B6D4]">PostgreSQL</p>
                  <p className="text-[0.7vw] text-[#A0A0A0]">Users, Content</p>
                </div>
                <div className="bg-[#F59E0B]/20 border border-[#F59E0B]/40 rounded-lg p-[1vw] text-center">
                  <p className="text-[0.9vw] font-bold text-[#F59E0B]">AsyncStorage</p>
                  <p className="text-[0.7vw] text-[#A0A0A0]">Local Cache</p>
                </div>
                <div className="bg-[#10B981]/20 border border-[#10B981]/40 rounded-lg p-[1vw] text-center">
                  <p className="text-[0.9vw] font-bold text-[#10B981]">AI Engine</p>
                  <p className="text-[0.7vw] text-[#A0A0A0]">Recommendations</p>
                </div>
              </div>

              <div className="text-[#A0A0A0] text-[1.5vw]">&#9660;</div>

              {/* Admin */}
              <div className="w-[70%] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 rounded-xl p-[1.5vw] text-center">
                <p className="text-[1vw] font-bold text-[#8B5CF6]">Admin Dashboard</p>
                <p className="text-[0.8vw] text-[#A0A0A0]">Analytics, Moderation, User Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        10 / 15
      </div>
    </div>
  );
}
