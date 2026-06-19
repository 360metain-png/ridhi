export type PodcastCategory =
  | "All"
  | "Comedy"
  | "News"
  | "Bollywood"
  | "Cricket"
  | "Business"
  | "Spirituality"
  | "Technology"
  | "Education"
  | "True Crime"
  | "Health"
  | "Politics";

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  podcastName: string;
  hostName: string;
  hostAvatar: string;
  isVerified: boolean;
  title: string;
  description: string;
  coverImage: string;
  category: PodcastCategory;
  language: string;
  durationMin: number;
  plays: number;
  likes: number;
  comments: number;
  isVideo: boolean;
  isLive: boolean;
  isExclusive: boolean;
  hasAITranscript: boolean;
  uploadedAgo: string;
  tags: string[];
  chapters?: { time: string; title: string }[];
}

export const PODCAST_CATEGORIES: PodcastCategory[] = [
  "All", "Comedy", "News", "Bollywood", "Cricket", "Business",
  "Spirituality", "Technology", "Education", "True Crime", "Health", "Politics",
];

export const TRENDING_EPISODES: PodcastEpisode[] = [
  {
    id: "ep1",
    podcastId: "pc1",
    podcastName: "Desi Laughs",
    hostName: "Rohan Joshi",
    hostAvatar: "https://i.pravatar.cc/150?img=11",
    isVerified: true,
    title: "Why Every Indian Family Has a Group Called 'Family' 😂",
    description: "We dive into the chaos of Indian WhatsApp groups, drama at weddings, and why moms always know when you're lying.",
    coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
    category: "Comedy",
    language: "Hindi",
    durationMin: 42,
    plays: 218400,
    likes: 14200,
    comments: 892,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "2h ago",
    tags: ["comedy", "family", "hindi", "whatsapp", "desi"],
    chapters: [
      { time: "00:00", title: "Intro — The Family Group" },
      { time: "08:30", title: "Wedding Drama Compilation" },
      { time: "22:10", title: "Mom's Spidey Sense" },
      { time: "35:00", title: "Listener Stories" },
    ],
  },
  {
    id: "ep2",
    podcastId: "pc2",
    podcastName: "India Business Today",
    hostName: "Priya Kapoor",
    hostAvatar: "https://i.pravatar.cc/150?img=47",
    isVerified: true,
    title: "Startup India 2026: Who's Building the Next Unicorn?",
    description: "We speak with 3 founders from Tier-2 cities disrupting fintech, agri-tech, and edtech.",
    coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    category: "Business",
    language: "English",
    durationMin: 58,
    plays: 94500,
    likes: 6700,
    comments: 310,
    isVideo: true,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "5h ago",
    tags: ["startup", "business", "india", "unicorn", "fintech"],
    chapters: [
      { time: "00:00", title: "India's Startup Moment" },
      { time: "12:00", title: "Guest 1 — Fintech Founder" },
      { time: "28:00", title: "Guest 2 — Agri-Tech" },
      { time: "44:00", title: "Guest 3 — Edtech" },
    ],
  },
  {
    id: "ep3",
    podcastId: "pc3",
    podcastName: "Cricket Ki Baat",
    hostName: "Ajit Agarkar Fan Club",
    hostAvatar: "https://i.pravatar.cc/150?img=33",
    isVerified: false,
    title: "T20 World Cup 2026 — Bold Predictions 🏏",
    description: "Deep analysis on squad selection, pitch conditions, and who takes the trophy this year.",
    coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400",
    category: "Cricket",
    language: "Hindi",
    durationMin: 67,
    plays: 341000,
    likes: 28900,
    comments: 1840,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: false,
    uploadedAgo: "1d ago",
    tags: ["cricket", "t20", "worldcup", "india", "icc"],
  },
  {
    id: "ep4",
    podcastId: "pc4",
    podcastName: "Bollywood Unplugged",
    hostName: "Neha Sharma",
    hostAvatar: "https://i.pravatar.cc/150?img=48",
    isVerified: true,
    title: "EXCLUSIVE: Shah Rukh Khan on Failure, Fatherhood & the Future",
    description: "A rare, unfiltered conversation with King Khan about what keeps him going after 30 years in the industry.",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    category: "Bollywood",
    language: "Hindi",
    durationMin: 88,
    plays: 1200000,
    likes: 94000,
    comments: 7200,
    isVideo: true,
    isLive: false,
    isExclusive: true,
    hasAITranscript: true,
    uploadedAgo: "3d ago",
    tags: ["srk", "bollywood", "exclusive", "interview", "hindi"],
  },
  {
    id: "ep5",
    podcastId: "pc5",
    podcastName: "Gyan Ganga",
    hostName: "Swami Vedananda",
    hostAvatar: "https://i.pravatar.cc/150?img=6",
    isVerified: true,
    title: "Bhagavad Gita — Chapter 2: The Path of the Yogi",
    description: "A calm, modern reading of Chapter 2 with practical life lessons for today's generation.",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    category: "Spirituality",
    language: "Sanskrit",
    durationMin: 35,
    plays: 87000,
    likes: 9400,
    comments: 420,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "12h ago",
    tags: ["gita", "spirituality", "yoga", "vedic", "meditation"],
  },
  {
    id: "ep6",
    podcastId: "pc6",
    podcastName: "Tech Talks India",
    hostName: "Amit Bhardwaj",
    hostAvatar: "https://i.pravatar.cc/150?img=15",
    isVerified: false,
    title: "AI is Transforming Indian Careers — Should You Adapt?",
    description: "We break down which careers are future-proof, which are evolving, and what skills you need to stay ahead.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    category: "Technology",
    language: "English",
    durationMin: 51,
    plays: 156000,
    likes: 11200,
    comments: 650,
    isVideo: true,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "6h ago",
    tags: ["ai", "technology", "career", "future", "india"],
  },
  {
    id: "ep7",
    podcastId: "pc7",
    podcastName: "South Cinema Central",
    hostName: "Kavya Reddy",
    hostAvatar: "https://i.pravatar.cc/150?img=49",
    isVerified: true,
    title: "Tollywood to Mollywood: India's South Cinema Boom",
    description: "RRR, Pushpa, KGF — why South Indian cinema is dominating the box office.",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    category: "Bollywood",
    language: "Telugu",
    durationMin: 45,
    plays: 234000,
    likes: 18700,
    comments: 920,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "8h ago",
    tags: ["tollywood", "southcinema", "telugu", "movies", "bollywood"],
  },
  {
    id: "ep8",
    podcastId: "pc8",
    podcastName: "Health & Heritage",
    hostName: "Dr. Priya Menon",
    hostAvatar: "https://i.pravatar.cc/150?img=50",
    isVerified: true,
    title: "Ayurveda vs Modern Medicine: Finding the Balance",
    description: "Ancient wisdom meets modern science. How Ayurveda is making a comeback in urban India.",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    category: "Health",
    language: "English",
    durationMin: 38,
    plays: 189000,
    likes: 14500,
    comments: 780,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "1d ago",
    tags: ["ayurveda", "health", "wellness", "india", "medicine"],
  },
  {
    id: "ep9",
    podcastId: "pc9",
    podcastName: "Politics Pulse",
    hostName: "Arun Nair",
    hostAvatar: "https://i.pravatar.cc/150?img=51",
    isVerified: false,
    title: "2026 Elections: Youth Vote Power & Social Media Influence",
    description: "How Instagram reels and WhatsApp forwards are shaping Indian political discourse.",
    coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    category: "Politics",
    language: "Hindi",
    durationMin: 55,
    plays: 278000,
    likes: 21000,
    comments: 1340,
    isVideo: true,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "4h ago",
    tags: ["politics", "elections", "youth", "socialmedia", "india"],
  },
  {
    id: "ep10",
    podcastId: "pc10",
    podcastName: "True Crime India",
    hostName: "Ria Sen",
    hostAvatar: "https://i.pravatar.cc/150?img=52",
    isVerified: false,
    title: "The Noida Double Murder: A Deep Investigation",
    description: "A chilling look at one of India's most infamous cases. New evidence never before discussed.",
    coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
    category: "True Crime",
    language: "Hindi",
    durationMin: 72,
    plays: 412000,
    likes: 32000,
    comments: 2100,
    isVideo: false,
    isLive: false,
    isExclusive: true,
    hasAITranscript: true,
    uploadedAgo: "2d ago",
    tags: ["truecrime", "india", "noida", "mystery", "investigation"],
  },
  {
    id: "ep11",
    podcastId: "pc11",
    podcastName: "Bharat Bytes",
    hostName: "Vikram Malhotra",
    hostAvatar: "https://i.pravatar.cc/150?img=53",
    isVerified: true,
    title: "Digital India: From UPI to AI Governance",
    description: "How India's digital infrastructure is leapfrogging the world, from payments to public services.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    category: "Technology",
    language: "English",
    durationMin: 48,
    plays: 198000,
    likes: 15600,
    comments: 890,
    isVideo: false,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "10h ago",
    tags: ["digitalindia", "upi", "ai", "government", "tech"],
  },
  {
    id: "ep12",
    podcastId: "pc12",
    podcastName: "Foodie Bharat",
    hostName: "Chef Sanjay",
    hostAvatar: "https://i.pravatar.cc/150?img=54",
    isVerified: true,
    title: "India's Lost Recipes: Revival of Ancient Cuisine",
    description: "From the kitchens of royal palaces to tribal villages, rediscovering forgotten Indian flavors.",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    category: "Health",
    language: "Hindi",
    durationMin: 40,
    plays: 267000,
    likes: 19800,
    comments: 1200,
    isVideo: true,
    isLive: false,
    isExclusive: false,
    hasAITranscript: true,
    uploadedAgo: "1d ago",
    tags: ["food", "recipes", "india", "culture", "cuisine"],
  },
];

export const LIVE_NOW: PodcastEpisode[] = [
  {
    id: "live1",
    podcastId: "lpc1",
    podcastName: "Morning Chai with Maya",
    hostName: "Maya Iyer",
    hostAvatar: "https://i.pravatar.cc/150?img=49",
    isVerified: true,
    title: "LIVE: Sunday Morning Gossip & News ☕",
    description: "Live now — join the conversation!",
    coverImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    category: "News",
    language: "Tamil",
    durationMin: 0,
    plays: 3420,
    likes: 890,
    comments: 241,
    isVideo: true,
    isLive: true,
    isExclusive: false,
    hasAITranscript: false,
    uploadedAgo: "Live",
    tags: ["live", "morning", "news", "tamil"],
  },
];

export const PODCAST_LANGUAGES = [
  "Hindi", "English", "Tamil", "Telugu", "Bengali",
  "Marathi", "Gujarati", "Kannada", "Punjabi", "Malayalam",
  "Odia", "Assamese", "Urdu", "Sanskrit",
];

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) return "Live";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

// ─── Podcast Room ──────────────────────────────────────────────────────────────

export type PodcastRoomCategory =
  | "Entertainment" | "Relationships" | "Gaming" | "Music"
  | "Motivation" | "College Talks" | "Regional" | "Business";

export const PODCAST_ROOM_CATEGORIES: PodcastRoomCategory[] = [
  "Entertainment", "Relationships", "Gaming", "Music",
  "Motivation", "College Talks", "Regional", "Business",
];

export interface PodcastSpeaker {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  followersCount: string;
  isVerified: boolean;
}

export interface PodcastChatMsg {
  id: string;
  user: string;
  text: string;
  coins?: number;
  type: "chat" | "question" | "priority" | "join" | "pin";
  time: string;
}

export const PODCAST_ROOM_SPEAKERS: PodcastSpeaker[] = [
  { id: "sp1", name: "Maya Iyer",    isHost: true,  isMuted: false, isSpeaking: true,  followersCount: "124K", isVerified: true  },
  { id: "sp2", name: "Rohan Joshi",  isHost: false, isMuted: false, isSpeaking: false, followersCount: "18.4K",isVerified: true  },
  { id: "sp3", name: "Priya K",      isHost: false, isMuted: true,  isSpeaking: false, followersCount: "8.2K", isVerified: false },
  { id: "sp4", name: "Amit Bhardwaj",isHost: false, isMuted: false, isSpeaking: true,  followersCount: "31K",  isVerified: false },
];

export const PODCAST_ROOM_CHAT: PodcastChatMsg[] = [
  { id: "c1", user: "Rahul S",    text: "This is such a great discussion! 🙌",                                          type: "chat",     time: "5m"  },
  { id: "c2", user: "Sneha M",    text: "Maya your voice is so calming ❤️",                                             type: "chat",     time: "4m"  },
  { id: "c3", user: "Vikram T",   text: "Can you talk about work-life balance in Indian families?",     coins: 10,       type: "question", time: "3m"  },
  { id: "c4", user: "Anjali D",   text: "⚡ PRIORITY: Relationship between career and mental health?",  coins: 49,       type: "priority", time: "2m"  },
  { id: "c5", user: "Devraj K",   text: "Just joined from Chennai! 🙏",                                                 type: "join",     time: "90s" },
  { id: "c6", user: "Pooja R",    text: "This podcast changed my perspective on relationships",                          type: "chat",     time: "1m"  },
  { id: "c7", user: "Arjun S",    text: "Are you also streaming on YouTube?",                           coins: 10,       type: "question", time: "30s" },
  { id: "c8", user: "Meera N",    text: "📌 PINNED: Share your biggest relationship lesson below!",     coins: 15,       type: "pin",      time: "10s" },
];

export const COIN_ACTIONS = [
  { id: "ask",      icon: "help-circle",  label: "Ask Question",      desc: "Send your question to the host",         coins: 10,  color: "#7B2FBE" },
  { id: "priority", icon: "zap",          label: "Priority Question",  desc: "Jump to top of the queue",              coins: 49,  color: "#E91E8C" },
  { id: "pin",      icon: "bookmark",     label: "Pin Comment",        desc: "Pin your comment for 5 minutes",        coins: 15,  color: "#FFB800" },
  { id: "replay",   icon: "repeat",       label: "Replay Access",      desc: "Unlock full recording after the show",  coins: 49,  color: "#00BCD4" },
  { id: "boost",    icon: "trending-up",  label: "Podcast Boost",      desc: "Push this room to the Explore feed",    coins: 99,  color: "#FF3B30" },
] as const;

export type CoinActionId = typeof COIN_ACTIONS[number]["id"];

export const FOLLOWING_CREATORS = [
  { id: "fc1", name: "Maya Iyer",    category: "Relationships", isLive: true  },
  { id: "fc2", name: "Rohan Joshi",  category: "Comedy",        isLive: false },
  { id: "fc3", name: "Priya Kapoor", category: "Business",      isLive: true  },
  { id: "fc4", name: "Swami V",      category: "Spirituality",  isLive: false },
  { id: "fc5", name: "Amit B",       category: "Technology",    isLive: false },
  { id: "fc6", name: "Neha Sharma",  category: "Bollywood",     isLive: false },
];
