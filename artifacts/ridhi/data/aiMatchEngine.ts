// AI Matchmaking Engine — calculates compatibility scores for Ridhi users
// based on interests, language, location, age, and personality factors

import { MATCH_PROFILES } from "./mockData";

// ── Types ───────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  language: string;
  bio: string;
  interests: string[];
  distance?: string;
  imageUri?: string;
  vipTier?: string;
  zodiacSign?: string;
  vibeStar?: number;
  compatibilityScore?: number;
  matchPercent?: number;
}

export interface CompatibilityResult {
  score: number;           // 0-100
  matchReasons: string[];    // Human-readable reasons
  sharedInterests: string[];
  languageMatch: boolean;
  ageCompatibility: number;  // 0-100
  locationProximity: number; // 0-100
  personalityMatch: number;  // 0-100
}

export interface AISuggestedMatch {
  profile: UserProfile;
  compatibility: CompatibilityResult;
  aiIcebreaker: string;
  aiTip: string;
  matchType: "high" | "trending" | "nearby" | "interest";
}

// ── Scoring Weights ────────────────────────────────────────────────────────
const WEIGHTS = {
  interests: 0.35,
  language: 0.20,
  age: 0.15,
  location: 0.15,
  bio: 0.15,
};

// ── Interest Keywords Database ─────────────────────────────────────────────
const INTEREST_KEYWORDS: Record<string, string[]> = {
  Music: ["music", "song", "singer", "guitar", "piano", "rap", "hip-hop", "bollywood", "classical", "carnatic"],
  Dance: ["dance", "dancing", "bharatnatyam", "kathak", "bhangra", "garba", "salsa"],
  Food: ["food", "cooking", "chef", "biryani", "chai", "foodie", "restaurant", "cuisine"],
  Travel: ["travel", "travelling", "trip", "wanderlust", "backpacking", "road trip", "mountains", "beach"],
  Movies: ["movie", "film", "cinema", "bollywood", "hollywood", "actor", "director"],
  Cricket: ["cricket", "ipl", "batsman", "bowler", "virat", "ms dhoni", "team india"],
  Fitness: ["fitness", "gym", "workout", "yoga", "running", "health", "meditation"],
  Art: ["art", "painting", "sketch", "creative", "design", "artist"],
  Gaming: ["game", "gaming", "gamer", "pubg", "bgmi", "esports", "playstation"],
  Books: ["book", "reading", "novel", "literature", "poetry", "writer", "author"],
  Photography: ["photo", "photography", "camera", "dslr", "click", "portrait"],
  Comedy: ["comedy", "funny", "humor", "stand-up", "meme", "joke"],
  Fashion: ["fashion", "style", "outfit", "clothing", "trend", "model"],
  Tech: ["tech", "technology", "coding", "programming", "developer", "startup", "ai"],
  Business: ["business", "entrepreneur", "startup", "founder", "investor", "marketing"],
};

// ── Language Compatibility Matrix ──────────────────────────────────────────
const LANG_COMPATIBILITY: Record<string, string[]> = {
  Hindi: ["Hindi", "English", "Urdu", "Punjabi"],
  Bengali: ["Bengali", "Hindi", "English", "Odia"],
  Telugu: ["Telugu", "Hindi", "English", "Tamil", "Kannada"],
  Marathi: ["Marathi", "Hindi", "English", "Gujarati"],
  Tamil: ["Tamil", "Telugu", "English", "Hindi", "Malayalam"],
  Gujarati: ["Gujarati", "Hindi", "English", "Marathi"],
  Kannada: ["Kannada", "Telugu", "Hindi", "English", "Tamil"],
  Malayalam: ["Malayalam", "Tamil", "Hindi", "English"],
  Punjabi: ["Punjabi", "Hindi", "English", "Urdu"],
  Odia: ["Odia", "Bengali", "Hindi", "English"],
  English: ["English", "Hindi", "Tamil", "Telugu", "Bengali"],
};

// ── City Proximity (same state / nearby cities) ────────────────────────────
const CITY_REGIONS: Record<string, string[]> = {
  Mumbai: ["Mumbai", "Pune", "Nashik", "Thane", "Navi Mumbai"],
  Delhi: ["Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad"],
  Bangalore: ["Bangalore", "Mysore", "Hassan", "Tumkur"],
  Chennai: ["Chennai", "Coimbatore", "Salem", "Madurai"],
  Hyderabad: ["Hyderabad", "Secunderabad", "Warangal"],
  Kolkata: ["Kolkata", "Howrah", "Durgapur", "Asansol"],
  Kochi: ["Kochi", "Trivandrum", "Calicut", "Thrissur"],
  Ahmedabad: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Amritsar: ["Amritsar", "Ludhiana", "Jalandhar", "Chandigarh"],
  Pune: ["Pune", "Mumbai", "Nashik"],
};

// ── AI Compatibility Engine ────────────────────────────────────────────────
export function calculateCompatibility(
  user: UserProfile,
  candidate: UserProfile
): CompatibilityResult {
  // 1. Interests overlap
  const shared = user.interests.filter((i) => candidate.interests.includes(i));
  const interestScore = Math.min(
    (shared.length / Math.max(user.interests.length, 3)) * 100,
    100
  );

  // 2. Language compatibility
  const userLangs = LANG_COMPATIBILITY[user.language] ?? [user.language];
  const languageMatch = userLangs.includes(candidate.language);
  const languageScore = languageMatch ? 100 : 30;

  // 3. Age compatibility (optimal: ±2 years)
  const ageDiff = Math.abs(user.age - candidate.age);
  const ageScore = Math.max(0, 100 - ageDiff * 8);

  // 4. Location proximity
  let locationScore = 50;
  const userRegions = Object.entries(CITY_REGIONS).find(([, cities]) =>
    cities.includes(user.city)
  );
  if (userRegions) {
    const regionCities = userRegions[1];
    if (regionCities.includes(candidate.city)) {
      locationScore = 100;
    } else if (candidate.city === user.city) {
      locationScore = 100;
    } else {
      locationScore = 40;
    }
  } else if (candidate.city === user.city) {
    locationScore = 100;
  }

  // 5. Bio/personality analysis (keyword matching)
  const bioScore = analyzeBioCompatibility(user.bio, candidate.bio);

  // Weighted total
  const total =
    interestScore * WEIGHTS.interests +
    languageScore * WEIGHTS.language +
    ageScore * WEIGHTS.age +
    locationScore * WEIGHTS.location +
    bioScore * WEIGHTS.bio;

  // Generate reasons
  const reasons: string[] = [];
  if (shared.length > 0) {
    reasons.push(
      `Both love ${shared.slice(0, 2).join(" & ")}`
    );
  }
  if (languageMatch) {
    reasons.push(`Speaks ${candidate.language}`);
  }
  if (ageDiff <= 3) {
    reasons.push("Perfect age match");
  }
  if (locationScore >= 80) {
    reasons.push(`Nearby in ${candidate.city}`);
  }
  if (bioScore > 70) {
    reasons.push("Great personality fit");
  }

  return {
    score: Math.round(total),
    matchReasons: reasons,
    sharedInterests: shared,
    languageMatch,
    ageCompatibility: Math.round(ageScore),
    locationProximity: Math.round(locationScore),
    personalityMatch: Math.round(bioScore),
  };
}

function analyzeBioCompatibility(bio1: string, bio2: string): number {
  const keywords = Object.values(INTEREST_KEYWORDS).flat();
  const words1 = bio1.toLowerCase().split(/\s+/);
  const words2 = bio2.toLowerCase().split(/\s+/);

  let matches = 0;
  for (const kw of keywords) {
    if (words1.some((w) => w.includes(kw)) && words2.some((w) => w.includes(kw))) {
      matches++;
    }
  }

  return Math.min(100, matches * 20 + 40);
}

// ── AI Icebreaker Generator ───────────────────────────────────────────────
export function generateIcebreaker(
  user: UserProfile,
  match: UserProfile,
  compatibility: CompatibilityResult
): string {
  const shared = compatibility.sharedInterests;
  const lang = match.language;

  const icebreakers: Record<string, string[]> = {
    Hindi: [
      "Namaste! 🙏 Aapke profile se pata chala ki hum dono ko {interest} pasand hai. Kya aap bhi {city} mein rehte hain?",
      "Hey! 🎵 Aapne {interest} ke baare mein likha hai. Mujhe bhi yeh bahut pasand hai. Kya aapne koi recent event attend kiya?",
      "Namaste! 🌟 Aapki profile bahut interesting hai. {interest} mein aapka experience kaisa raha?",
    ],
    English: [
      "Hey there! 👋 I noticed we both love {interest}. Have you been to any cool {interest} events in {city}?",
      "Hi! 🎵 Your profile says you love {interest}. Me too! What's your favorite {interest} memory?",
      "Hello! 🌟 I see we share an interest in {interest}. Would love to hear your story about it!",
    ],
    Bengali: [
      "Namoshkar! 🙏 Amra duijon ke {interest} bhalo lage. Apni ki {city} te thaken?",
    ],
    Telugu: [
      "Namaskaram! 🙏 Manam iddaram ki {interest} ante istam. Miru {city} lo untara?",
    ],
    Tamil: [
      "Vanakkam! 🙏 Namma rendu perukkum {interest} pidikkum. Neengal {city} la irukeengala?",
    ],
    Marathi: [
      "Namaskar! 🙏 Aaplyala donhi na {interest} avadte. Tumhi {city} madhe rahata?",
    ],
    Gujarati: [
      "Namaste! 🙏 Aapne {interest} gmare chhe. Hu pan {city} ma rahun chhun.",
    ],
    Kannada: [
      "Namaskara! 🙏 Namage ibbarigu {interest} ishta. Neevu {city} dalli iddira?",
    ],
    Malayalam: [
      "Namaskaram! 🙏 Nammalkku randuperkkum {interest} ishtam aanu. Ningal {city} ilano?",
    ],
    Punjabi: [
      "Sat Sri Akal! 🙏 Asin doven nu {interest} pasand hai. Tussi {city} ch rehnde ho?",
    ],
    default: [
      "Hey! 👋 I noticed we both love {interest}. Want to chat about it?",
    ],
  };

  const langIcebreakers = icebreakers[lang] ?? icebreakers.default;
  const template = langIcebreakers[Math.floor(Math.random() * langIcebreakers.length)];

  const interest = shared[0] ?? match.interests[0] ?? "interesting things";
  return template
    .replace(/{interest}/g, interest)
    .replace(/{city}/g, match.city);
}

// ── AI Match Suggestions ───────────────────────────────────────────────────
export function getAIMatchSuggestions(
  user: UserProfile,
  count: number = 5
): AISuggestedMatch[] {
  const candidates = MATCH_PROFILES.filter(
    (p) => p.id !== user.id && p.gender !== user.gender
  );

  const scored = candidates.map((candidate) => {
    const compatibility = calculateCompatibility(user, candidate as UserProfile);
    const icebreaker = generateIcebreaker(user, candidate as UserProfile, compatibility);

    let matchType: AISuggestedMatch["matchType"] = "interest";
    if (compatibility.score >= 85) matchType = "high";
    else if (compatibility.score >= 70) matchType = "trending";
    else if (compatibility.locationProximity >= 80) matchType = "nearby";

    return {
      profile: candidate as UserProfile,
      compatibility,
      aiIcebreaker: icebreaker,
      aiTip: generateMatchTip(candidate as UserProfile, compatibility),
      matchType,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.compatibility.score - a.compatibility.score);

  return scored.slice(0, count);
}

function generateMatchTip(
  profile: UserProfile,
  compatibility: CompatibilityResult
): string {
  const tips = [
    "Start with a shared interest for the best response rate",
    "Ask about their favorite {interest} spot in {city}",
    "Mention you both speak {language} — instant connection!",
    "They have a {vibeStar}-star vibe rating — very popular!",
  ];

  const tip = tips[Math.floor(Math.random() * tips.length)];
  return tip
    .replace(/{interest}/g, compatibility.sharedInterests[0] ?? profile.interests[0] ?? "hobby")
    .replace(/{city}/g, profile.city)
    .replace(/{language}/g, profile.language)
    .replace(/{vibeStar}/g, String(profile.vibeStar ?? 4));
}

// ── AI Chat Reply Suggestions ────────────────────────────────────────────────
export function suggestReplies(
  lastMessage: string,
  user: UserProfile,
  other: UserProfile
): string[] {
  const msg = lastMessage.toLowerCase();
  const shared = user.interests.filter((i) => other.interests.includes(i));

  // Context-based suggestions
  if (msg.includes("?")) {
    return [
      "Great question! 👍",
      "Hmm, let me think... 🤔",
      `As someone who loves ${shared[0] ?? "interesting things"}, I'd say yes!`,
    ];
  }

  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return [
      `Hey! 🙋 Nice to meet you! I saw you love ${shared[0] ?? "cool stuff"} too!`,
      "Hello! 👋 How's your day going?",
      "Hi there! ✨ Excited to chat with you!",
    ];
  }

  if (msg.includes("food") || msg.includes("eat") || msg.includes("restaurant")) {
    return [
      "I love food too! 🍜 What's your favorite cuisine?",
      "Have you tried any good places in your city?",
      "We should share food recommendations! 😋",
    ];
  }

  if (msg.includes("music") || msg.includes("song") || msg.includes("artist")) {
    return [
      "Music is life! 🎵 What are you listening to lately?",
      "Any favorite artists? I'm always looking for recommendations!",
      "We should create a playlist together! 🎧",
    ];
  }

  if (msg.includes("travel") || msg.includes("trip") || msg.includes("place")) {
    return [
      "Travel is the best! ✈️ Where do you want to go next?",
      "Have you been anywhere exciting recently?",
      "Let's swap travel stories! 🌍",
    ];
  }

  // Generic suggestions
  return [
    "That's interesting! Tell me more 👀",
    "I totally agree! 👌",
    "Haha, same here! 😂",
    `Speaking of that, do you also like ${shared[0] ?? "exploring new things"}?`,
  ];
}

// ── Conversation Quality Check ───────────────────────────────────────────────
export function analyzeConversation(messages: { text: string; fromMe: boolean }[]): {
  quality: "good" | "stale" | "one_sided" | "new";
  suggestion: string;
  engagement: number; // 0-100
} {
  if (messages.length === 0) {
    return { quality: "new", suggestion: "Send a friendly greeting to start!", engagement: 0 };
  }

  const myMessages = messages.filter((m) => m.fromMe);
  const theirMessages = messages.filter((m) => !m.fromMe);

  // Check for stale conversation (no reply for many messages)
  if (theirMessages.length === 0) {
    return {
      quality: "one_sided",
      suggestion: "Try asking an open-ended question to get a response!",
      engagement: 20,
    };
  }

  const ratio = myMessages.length / (theirMessages.length + 1);
  if (ratio > 2) {
    return {
      quality: "one_sided",
      suggestion: "Give them space to respond. Maybe ask about their interests!",
      engagement: 35,
    };
  }

  // Check for very short responses
  const avgLength =
    messages.reduce((sum, m) => sum + (m.text?.length ?? 0), 0) / messages.length;
  if (avgLength < 10 && messages.length > 5) {
    return {
      quality: "stale",
      suggestion: "The conversation seems quiet. Try sharing a fun fact or photo!",
      engagement: 40,
    };
  }

  // Good engagement
  const engagement = Math.min(
    100,
    (messages.length * 10) + (avgLength * 2)
  );

  return {
    quality: "good",
    suggestion: "Great conversation! Keep it up! 🔥",
    engagement: Math.round(engagement),
  };
}
