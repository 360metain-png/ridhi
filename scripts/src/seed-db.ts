/**
 * Seed the Ridhi database with real user data and posts
 * Run: pnpm --filter @workspace/scripts run seed-db
 */
import { db } from "@workspace/db";
import { users, posts, follows, conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";

const INDIAN_NAMES = [
  "Ananya Sharma", "Rahul Verma", "Priya Patel", "Karan Malhotra",
  "Neha Gupta", "Arjun Nair", "Divya Iyer", "Suresh Kumar",
  "Meera Reddy", "Vikram Rao", "Sneha Das", "Amit Singh",
  "Kavya Krishnan", "Rohit Choudhury", "Pooja Mehta", "Deepak Jain",
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Kochi",
];

const LANGUAGES = ["hindi", "english", "tamil", "telugu", "bengali", "marathi", "gujarati", "punjabi", "kannada", "malayalam"];

const GENDERS = ["male", "female", "other"];

const INTERESTS_POOL = [
  ["music", "dance", "movies"],
  ["technology", "gaming", "travel"],
  ["food", "photography", "art"],
  ["fitness", "sports", "reading"],
  ["fashion", "cooking", "pets"],
];

const POST_CONTENTS = [
  "Amazing street food at Chandni Chowk today! The paranthas were absolutely divine ❤️",
  "Just watched a beautiful sunset at Marine Drive. Mumbai truly has my heart 🌅",
  "Learning Kathak dance for 3 months now. It's so graceful and challenging! 💃",
  "New startup idea brewing 💡 Building something for Indian creators. Stay tuned!",
  "Best dosa I've ever had is at this tiny shop in Bangalore. Rs 40 only! 🍜",
  "Weekend trek to Coorg was breathtaking. The coffee plantations are unreal ☕",
  "Finally finished reading 'The White Tiger'. What a powerful story about modern India 📚",
  "Playing BGMI with my squad tonight. Diamond rank grind continues 🎮",
  "Rajasthani folk music hits different. The raw energy and rhythm is unmatched 🎵",
  "DIY rangoli for Diwali prep! Spent 4 hours but worth every minute 🎀",
  "Delhi winters are something else. Hot chai + blanket + good book = perfection ☕",
  "Attended my first stand-up comedy show in Mumbai. Laughed till I cried 😂",
  "Hyderabad biryani supremacy. Fight me 🍜🔥",
  "Started learning Python coding. Any tips for a beginner? 💻",
  "Chennai filter coffee > everything else. This is not an opinion, it's a fact ☕",
  "Saree shopping in Kolkata is a sport. Bargained from 3000 to 1200 😅",
  "Festival season energy in India is unmatched. The lights, the food, the vibes ✨",
  "Just adopted a stray puppy from my street. Meet Milo! He's the cutest 🐶",
  "Goa trip planning with friends. Beach sunsets and seafood incoming 🏖️",
  "Punjabi wedding food is a different category of cuisine. Still dreaming about the butter chicken 🍜",
];

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
];

async function seed() {
  console.log("🚀 Seeding Ridhi database...");

  // Create users
  const createdUsers: any[] = [];
  for (let i = 0; i < INDIAN_NAMES.length; i++) {
    const name = INDIAN_NAMES[i];
    const phone = `+9198765${String(43210 + i).padStart(5, "0")}`;
    const city = CITIES[i % CITIES.length];
    const language = LANGUAGES[i % LANGUAGES.length];
    const gender = GENDERS[i % GENDERS.length];
    const interests = INTERESTS_POOL[i % INTERESTS_POOL.length];
    const avatar = AVATARS[i % AVATARS.length];
    const coins = [500, 1200, 89000, 3200, 6200000, 45000, 67000, 500, 12500, 89000, 0, 3200, 6200000, 500, 45000, 67000][i];

    const [user] = await db
      .insert(users)
      .values({
        phone,
        name,
        avatar,
        bio: `Living in ${city}. Passionate about ${interests.join(", ")}.`,
        city,
        gender: gender as "male" | "female" | "other",
        language: language as any,
        coins,
        plan: i < 4 ? "free" : i < 8 ? "gold" : i < 12 ? "platinum" : "diamond",
        interests,
      })
      .returning();

    createdUsers.push(user);
    console.log(`  ✅ Created user: ${name} (${phone}) — ${city}`);
  }

  // Create follows (each user follows ~5 random others)
  for (const user of createdUsers) {
    const followCount = 3 + Math.floor(Math.random() * 5);
    const shuffled = createdUsers.filter(u => u.id !== user.id).sort(() => Math.random() - 0.5);
    const toFollow = shuffled.slice(0, followCount);

    for (const target of toFollow) {
      try {
        await db.insert(follows).values({
          followerId: user.id,
          followingId: target.id,
        });
      } catch {
        // ignore duplicates
      }
    }
  }
  console.log(`  ✅ Created follows`);

  // Create posts (3-5 per user)
  for (const user of createdUsers) {
    const postCount = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < postCount; j++) {
      const content = POST_CONTENTS[Math.floor(Math.random() * POST_CONTENTS.length)];
      const likes = Math.floor(Math.random() * 300);
      const comments = Math.floor(Math.random() * 50);
      const shares = Math.floor(Math.random() * 30);

      await db.insert(posts).values({
        userId: user.id,
        content,
        images: j === 0 ? ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600"] : [],
        likesCount: likes,
        commentsCount: comments,
        sharesCount: shares,
        city: user.city,
        language: user.language,
      });
    }
  }
  console.log(`  ✅ Created ${createdUsers.length * 4} posts`);

  // Create sample conversations and messages
  const convPairs = [
    [createdUsers[0], createdUsers[1]],
    [createdUsers[2], createdUsers[3]],
    [createdUsers[4], createdUsers[5]],
    [createdUsers[6], createdUsers[7]],
  ];

  for (const [u1, u2] of convPairs) {
    const [conv] = await db
      .insert(conversations)
      .values({
        participantIds: [u1.id, u2.id],
      })
      .returning();

    const sampleMessages = [
      { content: "Hey! How are you?", senderId: u1.id },
      { content: "I'm good! Just posted about my trek 🏔️", senderId: u2.id },
      { content: "Saw it! Coorg looks amazing 🔥", senderId: u1.id },
      { content: "You should visit next month!", senderId: u2.id },
      { content: "Planning to! Let's go together?", senderId: u1.id },
    ];

    for (const msg of sampleMessages) {
      await db.insert(messages).values({
        conversationId: conv.id,
        senderId: msg.senderId,
        content: msg.content,
      });
    }

    await db
      .update(conversations)
      .set({
        lastMessage: sampleMessages[sampleMessages.length - 1].content,
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, conv.id));
  }
  console.log(`  ✅ Created 4 conversations with messages`);

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
