export interface ZodiacInfo {
  id: string;
  name: string;
  emoji: string;
  dates: string;
  element: "Fire" | "Earth" | "Air" | "Water";
}

export const ZODIAC_LIST: ZodiacInfo[] = [
  { id: "aries",       name: "Aries",       emoji: "♈", dates: "Mar 21 – Apr 19", element: "Fire"  },
  { id: "taurus",      name: "Taurus",      emoji: "♉", dates: "Apr 20 – May 20", element: "Earth" },
  { id: "gemini",      name: "Gemini",      emoji: "♊", dates: "May 21 – Jun 20", element: "Air"   },
  { id: "cancer",      name: "Cancer",      emoji: "♋", dates: "Jun 21 – Jul 22", element: "Water" },
  { id: "leo",         name: "Leo",         emoji: "♌", dates: "Jul 23 – Aug 22", element: "Fire"  },
  { id: "virgo",       name: "Virgo",       emoji: "♍", dates: "Aug 23 – Sep 22", element: "Earth" },
  { id: "libra",       name: "Libra",       emoji: "♎", dates: "Sep 23 – Oct 22", element: "Air"   },
  { id: "scorpio",     name: "Scorpio",     emoji: "♏", dates: "Oct 23 – Nov 21", element: "Water" },
  { id: "sagittarius", name: "Sagittarius", emoji: "♐", dates: "Nov 22 – Dec 21", element: "Fire"  },
  { id: "capricorn",   name: "Capricorn",   emoji: "♑", dates: "Dec 22 – Jan 19", element: "Earth" },
  { id: "aquarius",    name: "Aquarius",    emoji: "♒", dates: "Jan 20 – Feb 18", element: "Air"   },
  { id: "pisces",      name: "Pisces",      emoji: "♓", dates: "Feb 19 – Mar 20", element: "Water" },
];

/** Returns the zodiac sign id (e.g. "leo") from a day (1-31) and month (1-12). */
export function getZodiacSignId(day: number, month: number): string {
  if ((month === 3  && day >= 21) || (month === 4  && day <= 19)) return "aries";
  if ((month === 4  && day >= 20) || (month === 5  && day <= 20)) return "taurus";
  if ((month === 5  && day >= 21) || (month === 6  && day <= 20)) return "gemini";
  if ((month === 6  && day >= 21) || (month === 7  && day <= 22)) return "cancer";
  if ((month === 7  && day >= 23) || (month === 8  && day <= 22)) return "leo";
  if ((month === 8  && day >= 23) || (month === 9  && day <= 22)) return "virgo";
  if ((month === 9  && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1  && day <= 19)) return "capricorn";
  if ((month === 1  && day >= 20) || (month === 2  && day <= 18)) return "aquarius";
  return "pisces"; // Feb 19 – Mar 20
}

/** Returns the full ZodiacInfo from a birthday string ("YYYY-MM-DD") or null if invalid. */
export function getZodiacFromBirthday(birthday: string): ZodiacInfo | null {
  const parts = birthday.split("-");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  if (!month || !day) return null;
  const id = getZodiacSignId(day, month);
  return ZODIAC_LIST.find((z) => z.id === id) ?? null;
}

/** Calculates age in years from a birthday string ("YYYY-MM-DD"). */
export function getAgeFromBirthday(birthday: string): number {
  const [y, m, d] = birthday.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d)
  ) {
    age--;
  }
  return age;
}

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
