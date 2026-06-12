export default function Slide15() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-gradient-to-br from-[#0A0A0A] via-[#1A0A2E] to-[#0A0A0A]">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#7B2FBE] opacity-[0.08] blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[20%] w-[50%] h-[50%] rounded-full bg-[#E91E8C] opacity-[0.06] blur-[150px]" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[8vw]">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(123,47,190,0.4)]">
          <span className="text-white font-black text-5xl">R</span>
        </div>

        {/* Thank You */}
        <h1
          className="text-[5vw] font-black text-white tracking-tight text-center"
          style={{ fontFamily: 'var(--font-display-family)' }}
        >
          Thank You
        </h1>

        <div className="w-32 h-[2px] bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] my-8" />

        {/* Tagline */}
        <p
          className="text-[1.8vw] font-medium text-[#A0A0A0] text-center max-w-[50vw]"
          style={{ fontFamily: 'var(--font-body-family)' }}
        >
          Building India's Next Social Super-App
        </p>
        <p
          className="text-[1.2vw] text-[#A0A0A0] text-center mt-3 max-w-[40vw]"
        >
          One platform. 13 languages. 1.4 billion people.
        </p>

        {/* Contact */}
        <div className="mt-12 flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-10 py-6">
          <div className="text-center">
            <p className="text-[0.9vw] text-[#A0A0A0] mb-1">Contact</p>
            <p className="text-[1.1vw] text-white font-medium">investors@ridhi.app</p>
          </div>
          <div className="w-[1px] h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-[0.9vw] text-[#A0A0A0] mb-1">Website</p>
            <p className="text-[1.1vw] text-white font-medium">ridhi.app</p>
          </div>
          <div className="w-[1px] h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-[0.9vw] text-[#A0A0A0] mb-1">Download</p>
            <p className="text-[1.1vw] text-white font-medium">Play Store / App Store</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex items-center gap-4">
          <div className="bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] rounded-full px-8 py-3 text-white font-bold text-[1.1vw] shadow-[0_0_30px_rgba(123,47,190,0.3)]">
            Join the Journey
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[4vh] left-0 right-0 flex items-center justify-center gap-6 text-[0.9vw] text-[#A0A0A0]">
        <span>Confidential &amp; Proprietary</span>
        <span className="text-white/20">•</span>
        <span>Ridhi Technologies Pvt. Ltd.</span>
        <span className="text-white/20">•</span>
        <span>June 2026</span>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw] text-[1vw] text-[#A0A0A0]">
        15 / 15
      </div>
    </div>
  );
}
