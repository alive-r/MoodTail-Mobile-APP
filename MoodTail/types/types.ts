//datastructure

//Favorite
export type Favorite = Drink;

// Ingredient for Drink
export interface DrinkIngredient {
  name: string;
  measure?: string;
}

// DrinkEntity (full structure)
// partial completeness means 
// full completeness means 
export interface Drink {
  id: string;  // idDrink
  name: string; // strDrink
  thumb: string | null;
  alcoholicTag?: "Alcoholic" | "Non alcoholic" | "Optional alcohol" | "Unknown";
  instructions?: string | null;
  ingredients?: DrinkIngredient[]; // from strIngredient1..15 / strMeasure1..15 
  completeness: "partial" | "full";
}

export interface Ingredient {
  id: string;       // idIngredient
  name: string;     // strIngredient
  description?: string | null; // strDescription
  type?: string | null;        // strType
  abv?: string | null;         // strABV
}

export type IconKey =
  | "autumn" | "confused" | "content" | "disappointed" | "happy"
  | "hurt" | "laughing" | "mad" | "rainy" | "sad"
  | "shocked" | "shy" | "sleepy" | "sunny" | "surprised"
  | "winter" | "worried" | "spring" | "stormy" | "romantic" | "proud" | "bored" | "excited" | "relaxed"
  | "anxious" | "nostalgia" | "grateful" | "energetic" | "lonely" | "overwhelmed" 
  | "hopeful" | "frustrated" | "motivated" | "unhappy" | "guilty" | "embbarassed"
  | "curious" | "playful" | "calm" | "focused" | "stressed" | "nervous" | "peaceful" | "creative"
  | "inspired" | "lazy" | "homesick" | "adventurous" | "reflective" | "tipsy";

export type Scenario = { id: string; name: string; iconKey: IconKey };

export const OFFLINE_SCENARIOS: Scenario[] = [
  { id: "happy",        name: "Happy",        iconKey: "happy" },
  { id: "sad",          name: "Sad",          iconKey: "sad" },
  { id: "mad",          name: "Mad",          iconKey: "mad" },
  { id: "confused",     name: "Confused",     iconKey: "confused" },
  { id: "content",      name: "Content",      iconKey: "content" },
  { id: "disappointed", name: "Disappointed", iconKey: "disappointed" },
  { id: "hurt",         name: "Hurt",         iconKey: "hurt" },
  { id: "laughing",     name: "Laughing",     iconKey: "laughing" },
  { id: "rainy",        name: "Rainy",        iconKey: "rainy" },
  { id: "shocked",      name: "Shocked",      iconKey: "shocked" },
  { id: "shy",          name: "Shy",          iconKey: "shy" },
  { id: "sleepy",       name: "Sleepy",       iconKey: "sleepy" },
  { id: "sunny",        name: "Sunny",        iconKey: "sunny" },
  { id: "surprised",    name: "Surprised",    iconKey: "surprised" },
  { id: "worried",      name: "Worried",      iconKey: "worried" },
  { id: "autumn",       name: "Autumn",       iconKey: "autumn" },
  { id: "winter",       name: "Winter",       iconKey: "winter" },
  { id: "spring",       name: "Spring",       iconKey: "spring" },
  { id: "stormy",       name: "Stormy",       iconKey: "stormy" },
  { id: "romantic",     name: "Romantic",     iconKey: "romantic" },
  { id: "proud",        name: "Proud",        iconKey: "proud" },
  { id: "bored",        name: "Bored",        iconKey: "bored" },
  { id: "excited",      name: "Excited",      iconKey: "excited" },
  { id: "relaxed",      name: "Relaxed",      iconKey: "relaxed" },
  { id: "anxious",      name: "Anxious",      iconKey: "anxious" },
  { id: "nostalgia",    name: "Nostalgia",    iconKey: "nostalgia" },
  { id: "grateful",     name: "Grateful",     iconKey: "grateful" },
  { id: "energetic",    name: "Energetic",    iconKey: "energetic" },
  { id: "lonely",       name: "Lonely",       iconKey: "lonely" },
  { id: "overwhelmed",  name: "Overwhelmed",  iconKey: "overwhelmed" },
  { id: "hopeful",      name: "Hopeful",      iconKey: "hopeful" },
  { id: "frustrated",   name: "Frustrated",   iconKey: "frustrated" },
  { id: "motivated",    name: "Motivated",    iconKey: "motivated" },
  { id: "unhappy",      name: "Unhappy",      iconKey: "unhappy" },
  { id: "guilty",       name: "Guilty",       iconKey: "guilty" },
  { id: "embbarassed",  name: "Embbarassed",  iconKey: "embbarassed" },
  { id: "curious",      name: "Curious",      iconKey: "curious" },
  { id: "playful",      name: "Playful",      iconKey: "playful" },
  { id: "calm",         name: "Calm",         iconKey: "calm" },
  { id: "focused",      name: "Focused",      iconKey: "focused" },
  { id: "stressed",     name: "Stressed",     iconKey: "stressed" },
  { id: "nervous",      name: "Nervous",      iconKey: "nervous" },
  { id: "peaceful",     name: "Peaceful",     iconKey: "peaceful" },
  { id: "creative",     name: "Creative",     iconKey: "creative" },
  { id: "inspired",     name: "Inspired",     iconKey: "inspired" },
  { id: "lazy",         name: "Lazy",         iconKey: "lazy" },
  { id: "homesick",     name: "Homesick",     iconKey: "homesick" },
  { id: "adventurous",  name: "Adventurous",  iconKey: "adventurous" },
  { id: "reflective",   name: "Reflective",   iconKey: "reflective" },
  { id: "tipsy",        name: "Tipsy",        iconKey: "tipsy" },
];

export const ICONS: Record<IconKey, any> = {
  autumn: require("@/assets/icons/autumn.png"),
  confused: require("@/assets/icons/confused.png"),
  content: require("@/assets/icons/content.png"),
  disappointed: require("@/assets/icons/disappointed.png"),
  happy: require("@/assets/icons/happy.png"),
  hurt: require("@/assets/icons/hurt.png"),
  laughing: require("@/assets/icons/laughing.png"),
  mad: require("@/assets/icons/mad.png"),
  rainy: require("@/assets/icons/rainy.png"),
  sad: require("@/assets/icons/sad.png"),
  shocked: require("@/assets/icons/shocked.png"),
  shy: require("@/assets/icons/shy.png"),
  sleepy: require("@/assets/icons/sleepy.png"),
  sunny: require("@/assets/icons/sunny.png"),
  surprised: require("@/assets/icons/surprised.png"),
  winter: require("@/assets/icons/winter.png"),
  worried: require("@/assets/icons/worried.png"),
  spring: require("@/assets/icons/spring.png"),
  stormy: require("@/assets/icons/stormy.png"),
  romantic: require("@/assets/icons/romantic.png"),
  proud: require("@/assets/icons/proud.png"),
  bored: require("@/assets/icons/bored.png"),
  excited: require("@/assets/icons/excited.png"),
  relaxed: require("@/assets/icons/relaxed.png"),
  anxious: require("@/assets/icons/anxious.png"),
  nostalgia: require("@/assets/icons/nostalgia.png"),
  grateful: require("@/assets/icons/grateful.png"),
  energetic: require("@/assets/icons/energetic.png"),
  lonely: require("@/assets/icons/lonely.png"),
  overwhelmed: require("@/assets/icons/overwhelmed.png"),
  hopeful: require("@/assets/icons/hopeful.png"),
  frustrated: require("@/assets/icons/frustrated.png"),
  motivated: require("@/assets/icons/motivated.png"),
  unhappy: require("@/assets/icons/unhappy.png"),
  guilty: require("@/assets/icons/guilty.png"),
  embbarassed: require("@/assets/icons/embbarassed.png"),
  curious: require("@/assets/icons/curious.png"),
  playful: require("@/assets/icons/playful.png"),
  calm: require("@/assets/icons/calm.png"),
  focused: require("@/assets/icons/focused.png"),
  stressed: require("@/assets/icons/stressed.png"),
  nervous: require("@/assets/icons/nervous.png"),
  peaceful: require("@/assets/icons/peaceful.png"),
  creative: require("@/assets/icons/creative.png"),
  inspired: require("@/assets/icons/inspired.png"),
  lazy: require("@/assets/icons/lazy.png"),
  homesick: require("@/assets/icons/homesick.png"),
  adventurous: require("@/assets/icons/adventurous.png"),
  reflective: require("@/assets/icons/reflective.png"),
  tipsy: require("@/assets/icons/tipsy.png"),
};