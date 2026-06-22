export default function Slide1() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-gradient-to-br from-[#0A0A0A] via-[#1A0A2E] to-[#0A0A0A]">
      {/* Decorative purple glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#7B2FBE] opacity-[0.08] blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E91E8C] opacity-[0.06] blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[8vw]">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(123,47,190,0.4)]">
          <span className="text-white font-black text-4xl">R</span>
        </div>

        {/* Title */}
        <h1
          className="text-[6vw] font-black text-white tracking-tight leading-none text-center"
          style={{ fontFamily: 'var(--font-display-family)' }}
        >
          Ridhi
        </h1>
        <p
          className="text-[2vw] font-medium text-[#A0A0A0] mt-4 text-center tracking-wide"
          style={{ fontFamily: 'var(--font-body-family)' }}
        >
          India's First Social Networking & Dating Super-App
        </p>
        <p
          className="text-[1.2vw] font-medium text-[#E91E8C] mt-2 text-center tracking-wide"
          style={{ fontFamily: 'var(--font-body-family)' }}
        >
          A Product of Krilo Digitech Pvt Ltd
        </p>

        {/* Divider */}
        <div className="w-32 h-[2px] bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] mt-10 mb-8" />

        {/* Subtitle */}
        <p
          className="text-[1.4vw] text-[#A0A0A0] text-center max-w-[50vw]"
          style={{ fontFamily: 'var(--font-body-family)' }}
        >
          Think <span className="text-white font-semibold">ShareChat</span> × <span className="text-white font-semibold">Instagram</span> × <span className="text-white font-semibold">TikTok</span> × <span className="text-white font-semibold">Spotify</span>
          <br />Built for 1.4 billion Indians, in 13 regional languages
        </p>

        {/* Investment Round */}
        <div className="mt-12 flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-3">
          <span className="text-[#E91E8C] font-bold text-[1.2vw]">Seed Round</span>
          <span className="text-white/30">|</span>
          <span className="text-white text-[1.2vw] font-medium">$2.5M Raise</span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[4vh] left-0 right-0 flex items-center justify-center gap-8 text-[1vw] text-[#A0A0A0]">
        <span>Confidential &amp; Proprietary</span>
        <span className="text-white/20">•</span>
        <span>June 2026</span>
      </div>
    </div>
  );
}
