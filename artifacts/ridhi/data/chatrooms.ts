export interface Chatroom {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  onlineCount: number;
  language: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageUser: string;
  isJoined: boolean;
  isPinned?: boolean;
  isVerified?: boolean;
  emoji: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface RoomMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
  isPinned?: boolean;
  replyTo?: string;
  type: "text" | "system";
}

export const ROOM_CATEGORIES = [
  "All", "Bollywood", "Cricket", "Gaming", "Food", "Music",
  "Tech", "Fitness", "Travel", "Memes", "Relationships",
];

export const CHATROOMS: Chatroom[] = [
  {
    id: "cr1",
    name: "Bollywood Fanatics",
    description: "Latest Bollywood gossip, trailers, songs & celeb updates",
    category: "Bollywood",
    memberCount: 48200,
    onlineCount: 1842,
    language: "Hindi",
    lastMessage: "Did you watch the Stree 2 trailer??",
    lastMessageTime: "Just now",
    lastMessageUser: "Priya",
    isJoined: true,
    isPinned: true,
    isVerified: true,
    emoji: "🎬",
    gradientStart: "#E91E8C",
    gradientEnd: "#FF6B6B",
  },
  {
    id: "cr2",
    name: "Cricket Crazy",
    description: "Live match discussions, player stats, IPL & World Cup",
    category: "Cricket",
    memberCount: 92400,
    onlineCount: 5210,
    language: "Hindi",
    lastMessage: "Rohit is on 🔥 today!!",
    lastMessageTime: "1m ago",
    lastMessageUser: "Rahul",
    isJoined: false,
    isPinned: true,
    isVerified: true,
    emoji: "🏏",
    gradientStart: "#1E88E5",
    gradientEnd: "#00BCD4",
  },
  {
    id: "cr3",
    name: "BGMI & Free Fire",
    description: "Squad up, share tips, tournaments & highlights",
    category: "Gaming",
    memberCount: 35600,
    onlineCount: 2100,
    language: "Hindi",
    lastMessage: "Anyone up for ranked? Need a 4th",
    lastMessageTime: "2m ago",
    lastMessageUser: "Vivaan",
    isJoined: false,
    emoji: "🎮",
    gradientStart: "#7B2FBE",
    gradientEnd: "#3F51B5",
  },
  {
    id: "cr4",
    name: "Foodie Nation",
    description: "Recipes, restaurant finds, street food & mukbangs",
    category: "Food",
    memberCount: 22300,
    onlineCount: 876,
    language: "Hindi",
    lastMessage: "Best biryani spots in Hyderabad?",
    lastMessageTime: "5m ago",
    lastMessageUser: "Sneha",
    isJoined: false,
    emoji: "🍛",
    gradientStart: "#FF9800",
    gradientEnd: "#F44336",
  },
  {
    id: "cr5",
    name: "Indie Music India",
    description: "Underground artists, playlists, gigs & collaborations",
    category: "Music",
    memberCount: 14800,
    onlineCount: 432,
    language: "English",
    lastMessage: "Prateek Kuhad's new EP is everything 🎵",
    lastMessageTime: "8m ago",
    lastMessageUser: "Aryan",
    isJoined: false,
    emoji: "🎵",
    gradientStart: "#9C27B0",
    gradientEnd: "#E91E8C",
  },
  {
    id: "cr6",
    name: "Tech Talks India",
    description: "Startups, AI, coding, gadgets & career advice",
    category: "Tech",
    memberCount: 19200,
    onlineCount: 654,
    language: "English",
    lastMessage: "Claude vs GPT-4o vs Gemini — fight!",
    lastMessageTime: "12m ago",
    lastMessageUser: "Karan",
    isJoined: true,
    emoji: "💻",
    gradientStart: "#00BCD4",
    gradientEnd: "#1E88E5",
  },
  {
    id: "cr7",
    name: "Fitness Freaks",
    description: "Workouts, diet plans, transformations & motivation",
    category: "Fitness",
    memberCount: 28700,
    onlineCount: 920,
    language: "Hindi",
    lastMessage: "Day 30 transformation 💪 unbelievable",
    lastMessageTime: "15m ago",
    lastMessageUser: "Nisha",
    isJoined: false,
    emoji: "💪",
    gradientStart: "#4CAF50",
    gradientEnd: "#8BC34A",
  },
  {
    id: "cr8",
    name: "Wanderers of India",
    description: "Travel stories, hidden gems, budget tips & photos",
    category: "Travel",
    memberCount: 17500,
    onlineCount: 388,
    language: "Hindi",
    lastMessage: "Spiti Valley in December — doable?",
    lastMessageTime: "20m ago",
    lastMessageUser: "Aditi",
    isJoined: false,
    emoji: "✈️",
    gradientStart: "#FF5722",
    gradientEnd: "#FF9800",
  },
  {
    id: "cr9",
    name: "Desi Meme Factory",
    description: "Fresh desi memes, viral moments & relatable content",
    category: "Memes",
    memberCount: 67800,
    onlineCount: 3400,
    language: "Hindi",
    lastMessage: "BHAI 😭😭 this is too real",
    lastMessageTime: "Just now",
    lastMessageUser: "Yash",
    isJoined: true,
    emoji: "😂",
    gradientStart: "#FFD700",
    gradientEnd: "#FF9800",
  },
  {
    id: "cr10",
    name: "Dil Ki Baatein",
    description: "Open your heart — love, relationships, advice & support",
    category: "Relationships",
    memberCount: 31200,
    onlineCount: 1150,
    language: "Hindi",
    lastMessage: "Long distance is so hard sometimes...",
    lastMessageTime: "3m ago",
    lastMessageUser: "Anonymous",
    isJoined: false,
    emoji: "💕",
    gradientStart: "#E91E8C",
    gradientEnd: "#9C27B0",
  },
];

export const ROOM_MESSAGES: Record<string, RoomMessage[]> = {
  cr1: [
    { id: "rm1", userId: "u10", userName: "Shreya", text: "Just watched Fighter again for the 3rd time 🔥🔥", time: "3:40 PM", type: "text", reactions: [{ emoji: "🔥", count: 12 }, { emoji: "❤️", count: 8 }] },
    { id: "rm2", userId: "u11", userName: "Arjun", text: "Bhai Hrithik is on another level", time: "3:41 PM", type: "text" },
    { id: "rm3", userId: "u12", userName: "Priya", text: "Did you watch the Stree 2 trailer??", time: "3:44 PM", type: "text", reactions: [{ emoji: "😱", count: 24 }], isPinned: true },
    { id: "rm4", userId: "u13", userName: "Rohan", text: "YES omg the visual effects 😭", time: "3:44 PM", type: "text" },
    { id: "rm5", userId: "u14", userName: "Kavya", text: "Tamannaah Bhatia is carrying this movie", time: "3:45 PM", type: "text", reactions: [{ emoji: "👑", count: 31 }] },
    { id: "rm6", userId: "system", userName: "", text: "1,842 members online right now", time: "", type: "system" },
  ],
  cr2: [
    { id: "rm1", userId: "u20", userName: "Vivek", text: "India 289/4 in 45 overs", time: "4:10 PM", type: "text" },
    { id: "rm2", userId: "u21", userName: "Sanjay", text: "Rohit ki century aayi kya?", time: "4:11 PM", type: "text" },
    { id: "rm3", userId: "u22", userName: "Rahul", text: "Rohit is on 🔥 today!!", time: "4:12 PM", type: "text", reactions: [{ emoji: "🏏", count: 45 }, { emoji: "🔥", count: 38 }], isPinned: true },
    { id: "rm4", userId: "u23", userName: "Dhruv", text: "92 off 67 balls legend hai bhai", time: "4:13 PM", type: "text" },
    { id: "rm5", userId: "u24", userName: "Meena", text: "Need Shami next please 🙏", time: "4:14 PM", type: "text" },
    { id: "rm6", userId: "system", userName: "", text: "5,210 members watching live", time: "", type: "system" },
  ],
  cr6: [
    { id: "rm1", userId: "u30", userName: "Nikhil", text: "Anthropic just dropped Claude 4 and it's insane", time: "2:20 PM", type: "text", reactions: [{ emoji: "🤯", count: 19 }] },
    { id: "rm2", userId: "u31", userName: "Aisha", text: "I tested it yesterday, coding tasks are unreal", time: "2:22 PM", type: "text" },
    { id: "rm3", userId: "u32", userName: "Karan", text: "Claude vs GPT-4o vs Gemini — fight!", time: "2:25 PM", type: "text", reactions: [{ emoji: "😂", count: 14 }, { emoji: "🔥", count: 9 }], isPinned: true },
    { id: "rm4", userId: "u33", userName: "Preethi", text: "For code: Claude. For search: Gemini. Simple", time: "2:26 PM", type: "text" },
    { id: "rm5", userId: "u34", userName: "Rahul", text: "Indian AI startup scene is also growing fast! Sarvam, Krutrim...", time: "2:27 PM", type: "text" },
    { id: "rm6", userId: "system", userName: "", text: "654 members online right now", time: "", type: "system" },
  ],
  cr9: [
    { id: "rm1", userId: "u40", userName: "Raju", text: "Bhai ye exam pe betha hoon aur ye notification 😭", time: "5:00 PM", type: "text", reactions: [{ emoji: "😂", count: 102 }] },
    { id: "rm2", userId: "u41", userName: "Pinki", text: "BHAI 😭😭 this is too real", time: "5:01 PM", type: "text", reactions: [{ emoji: "💀", count: 77 }], isPinned: true },
    { id: "rm3", userId: "u42", userName: "Shyam", text: "Jab mummy puchti hai kitna padha 💀", time: "5:01 PM", type: "text" },
    { id: "rm4", userId: "u43", userName: "Yash", text: "Indian parents: beta doctor bano also Indian parents:", time: "5:02 PM", type: "text", reactions: [{ emoji: "😂", count: 234 }] },
    { id: "rm5", userId: "u44", userName: "Ananya", text: "The accuracy is ILLEGAL 😭😭", time: "5:03 PM", type: "text" },
    { id: "rm6", userId: "system", userName: "", text: "3,400 meme lords online", time: "", type: "system" },
  ],
};

export function getDefaultMessages(roomId: string): RoomMessage[] {
  return ROOM_MESSAGES[roomId] ?? [
    { id: "rm1", userId: "u99", userName: "System", text: "Welcome to the chatroom! Be respectful and have fun 🎉", time: "12:00 PM", type: "system" },
  ];
}
