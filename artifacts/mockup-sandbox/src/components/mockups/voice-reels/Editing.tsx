import './_group.css';
import { useState, useEffect, useRef } from 'react';

const VOICE_REELS = [
  { id: "v1", userName: "Rohan Joshi", userCity: "Mumbai", caption: "Why every Indian family has a WhatsApp group called 'Family' 😂", likes: 18200, comments: 1204, shares: 340, isLiked: false, duration: 42, category: "Comedy", plays: 218400, effects: ['reverb', 'pitch'] },
  { id: "v2", userName: "Priya Kapoor", userCity: "Delhi", caption: "Startup India: how to raise your first crore 🚀", likes: 9400, comments: 534, shares: 210, isLiked: true, duration: 18, category: "Business", plays: 154000, effects: [] },
  { id: "v3", userName: "Amit Verma", userCity: "Bangalore", caption: "Cricket World Cup predictions that actually make sense 🏏", likes: 25600, comments: 892, shares: 560, isLiked: false, duration: 36, category: "Cricket", plays: 312000, effects: ['echo'] },
];

const AUDIO_EFFECTS = [
  { id: 'reverb', name: 'Reverb', icon: '🌊', description: 'Concert hall echo' },
  { id: 'echo', name: 'Echo', icon: '🔊', description: 'Repeat delay' },
  { id: 'pitch', name: 'Pitch Shift', icon: '🎚️', description: 'Voice modulation' },
  { id: 'bass', name: 'Bass Boost', icon: '📢', description: 'Deepen tone' },
  { id: 'speed', name: 'Speed', icon: '⏩', description: '0.5x - 2x' },
  { id: 'normalize', name: 'Normalize', icon: '⚡', description: 'Auto-level volume' },
];

function formatCount(n: number) {
  return n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);
}

function Waveform({ active, progress }: { active: boolean, progress: number }) {
  const bars = [0.2,0.5,0.8,0.4,0.9,0.3,0.7,0.5,0.8,0.2,0.6,0.9,0.4,0.7,0.3,0.8,0.5,0.6,0.9,0.4,0.7,0.2,0.8,0.5,0.6,0.9,0.3,0.7,0.5,0.8];
  const litCount = Math.floor(progress * bars.length);
  return (
    <div className="flex items-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <div key={i} className="w-1 rounded-sm transition-all duration-300"
          style={{ height: active ? `${12 + h * 28}px` : '12px', backgroundColor: i < litCount ? '#fff' : 'rgba(255,255,255,0.25)', opacity: active ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

function EffectsOverlay({ effects, visible, onClose, onToggle }: { effects: string[], visible: boolean, onClose: () => void, onToggle: (id: string) => void }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end">
      <div className="w-full bg-[#1a1a2e] rounded-t-3xl border-t border-white/10 p-4 pb-8 animate-slide-up">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-white">Audio Effects</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AUDIO_EFFECTS.map(effect => {
            const isActive = effects.includes(effect.id);
            return (
              <button key={effect.id} onClick={() => onToggle(effect.id)} className={`p-3 rounded-xl border transition-all ${isActive ? 'bg-[#7B2FBE]/30 border-[#7B2FBE]/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{effect.icon}</span>
                  <span className="text-[13px] font-semibold text-white">{effect.name}</span>
                  {isActive && (
                    <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <p className="text-[10px] text-white/50 text-left">{effect.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-white">Volume Mix</span>
            <span className="text-[12px] text-[#E91E8C] font-semibold">85%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] rounded-full" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold text-[14px] hover:bg-white/5">
            Reset
          </button>
          <button className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] text-white font-semibold text-[14px]">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelCard({ reel, active }: { reel: typeof VOICE_REELS[0], active: boolean }) {
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [playing, setPlaying] = useState(active);
  const [progress, setProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [activeEffects, setActiveEffects] = useState<string[]>(reel.effects);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setPlaying(true);
      progressRef.current = 0;
      setProgress(0);
      intervalRef.current = setInterval(() => {
        progressRef.current += 0.02;
        setProgress(progressRef.current);
        if (progressRef.current >= 1) { clearInterval(intervalRef.current!); setPlaying(false); }
      }, reel.duration * 20);
    } else {
      setPlaying(false); setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, reel.duration]);

  const toggleEffect = (id: string) => {
    setActiveEffects(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]" />

      {/* Active Effects Badge */}
      {activeEffects.length > 0 && (
        <div className="absolute top-28 left-4 z-20 flex gap-2">
          {activeEffects.map(eid => {
            const effect = AUDIO_EFFECTS.find(e => e.id === eid);
            return effect ? (
              <div key={eid} className="px-2.5 py-1 rounded-full bg-[#7B2FBE]/40 border border-[#7B2FBE]/60 backdrop-blur-sm">
                <span className="text-[10px] text-white font-semibold">{effect.icon} {effect.name}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Effects Button */}
      <div className="absolute top-28 right-4 z-20">
        <button onClick={() => setShowEffects(true)} className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-sm text-lg">
          🎛️
        </button>
      </div>

      {/* Center Audio Player */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <button onClick={() => setPlaying(!playing)} className="w-[72px] h-[72px] rounded-full bg-black/30 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
          {playing ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        <Waveform active={playing} progress={progress} />
        <span className="text-[13px] text-white/70 font-medium">{Math.floor(progress * reel.duration)}s / {reel.duration}s</span>
        <span className="px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-[11px] font-semibold text-white tracking-wide">{reel.category}</span>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-20 pb-24 flex items-end gap-3">
        <div className="flex-1 mb-2">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B2FBE] to-[#E91E8C] flex items-center justify-center text-white text-sm font-bold">{reel.userName[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white drop-shadow">{reel.userName}</p>
              <p className="text-[12px] text-white/70">{reel.userCity}</p>
            </div>
            <button onClick={() => setIsFollowing(!isFollowing)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border ${isFollowing ? 'text-green-400 border-green-400/40 bg-green-400/10' : 'text-white border-white/40 bg-white/20'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
          </div>
          <p className="text-[14px] text-white leading-5 mb-1.5 drop-shadow line-clamp-2">{reel.caption}</p>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></svg>
            <span className="text-[11px] text-white/70">{formatCount(reel.plays)} plays</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 mb-2">
          <button onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }} className="flex flex-col items-center gap-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill={liked ? '#E91E8C' : 'none'} stroke={liked ? '#E91E8C' : 'white'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className={`text-[12px] font-medium ${liked ? 'text-[#E91E8C]' : 'text-white'}`}>{formatCount(likeCount)}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span className="text-[12px] text-white font-medium">{formatCount(reel.comments)}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span className="text-[12px] text-white font-medium">{formatCount(reel.shares)}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <span className="text-[12px] text-white font-medium">Reply</span>
          </button>
        </div>
      </div>

      <EffectsOverlay effects={activeEffects} visible={showEffects} onClose={() => setShowEffects(false)} onToggle={toggleEffect} />
    </div>
  );
}

export function Editing() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => { if (!containerRef.current) return; const idx = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight); setActiveIndex(Math.min(idx, VOICE_REELS.length - 1)); };

  return (
    <div className="w-[390px] h-[844px] bg-[#0A0A0A] overflow-hidden rounded-[40px] border-[8px] border-[#1a1a1a] relative mx-auto shadow-2xl">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pb-3">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
          <span className="text-[12px] font-semibold">Podcasts</span>
        </button>
        <h1 className="text-[16px] font-bold text-white drop-shadow">Voice Reels</h1>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <span className="text-[12px] font-semibold">Record</span>
        </button>
      </div>
      <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {VOICE_REELS.map((r, i) => (
          <div key={r.id} className="snap-start h-full w-full flex-shrink-0">
            <ReelCard reel={r} active={i === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
