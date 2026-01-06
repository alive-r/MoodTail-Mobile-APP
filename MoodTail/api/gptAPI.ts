export type AISuggestion = { name: string; reason: string };
export type AIPayload = { keywords: string[]; excludeNames?: string[]; count?: number };

export type AIVibeResponse = {
  intent: "recommend";
  settledWords: string[];
  cocktails: { name: string; why: string; zeroProofTwin?: string }[];
  oneLineCoaching?: string;
};

export type AISwapResponse = {
  intent: "swap_simplify";
  swaps: { have: string; use: string; note?: string }[];
  oneLineCoaching?: string;
};

export type PantryPick = {
  name: string;
  why: string;
  missing?: string[];
};

const OPENAI_API_KEY = "PUT YOUR API HERE";

const MODEL = "gpt-4.1-nano";
const TEMPERATURE = 0.3;
const TIMEOUT_MS = 20_000;

const THE_COCKTAILDB_RULES = [
  "Return ONLY cocktails that exist in TheCocktailDB, using their STANDARD English names.",
  "Do NOT invent names. Prefer classics and widely referenced recipes.",
  "If unsure, choose safer, widely known options.",
].join(" ");

const SYSTEM_CORE = [
  "You are a concise cocktail guide for a mobile app.",
  "Keep total reply compact (< 120 words if rendered).",
  THE_COCKTAILDB_RULES,
  "Output STRICT JSON exactly matching the provided JSON schema.",
  "No extra prose, no markdown. JSON only.",
].join(" ");

const RECOMMEND_USER_TEMPLATE = (words: string[], count: number, exclude: string[]) =>
  [
    `User vibe words: ${words.join(", ")}`,
    `Goal: select ${count} cocktails that match the vibe.`,
    exclude.length ? `Avoid these names: ${exclude.join(", ")}` : "No exclusions.",
    "For each cocktail, include a very short 'why' — one sentence that clearly links the user's vibe words to why this cocktail fits. Add an optional zero-proof twin when appropriate.",
    "Also include oneLineCoaching and up to 3 simple swaps.",
  ].join("\n");

const SWAP_USER_TEMPLATE = (base: string, ingredients: string[]) =>
  [
    `User asked for ingredient substitutions for: ${base}.`,
    `RECIPE_INGREDIENTS (use EXACTLY these as candidates for 'have'): ${ingredients.join(", ")}`,
    "Goal: Suggest realistic replacements when the user does NOT have one of the RECIPE_INGREDIENTS.",
    "",
    "Rules:",
    "- For each swap object:",
    "    - `have` = the ORIGINAL ingredient from RECIPE_INGREDIENTS (pick only from the list above).",
    "    - `use`  = the SUBSTITUTE to use instead when `have` is missing.",
    "- Do NOT invent or guess additional original ingredients beyond RECIPE_INGREDIENTS.",
    "- Provide 2-4 high-quality, practical swaps (fewer is fine if not all are reasonable).",
    "- Each item may include a short `note` (e.g., flavor/availability).",
    "- Also include oneLineCoaching as a short, encouraging sentence.",
  ].join('\n');

const INTRO_USER_TEMPLATE = (words: string[]) =>
  [
    `User vibe words: ${normalizeWords(words).join(", ") || "(none)"}`,
    "Goal: Write a concise intro for a cocktail list that will appear above the results.",
    "Constraints:",
    "- 2-3 sentences, no more than 80 words total.",
    "- No markdown.",
    "- Gently reflect or paraphrase the vibe words into taste/energy/occasion language.",
    "- Set expectation for the list that follows (tone, flavor, energy), do not mention specific cocktail names.",
  ].join("\n");

const RANK_FROM_PANTRY_TEMPLATE = (items: string[], candidates: string[], count: number) =>
  [
    `User pantry items: ${items.join(", ")}`,
    `Candidate cocktails (from previous suggestions): ${candidates.join(", ")}`,
    `Goal: pick the top ${count} cocktails that are MOST MAKEABLE with the pantry (fewest missing ingredients).`,
    "For each pick, give ONE short reason, and (optional) list of 0-3 missing ingredients.",
    "Prefer classics in TheCocktailDB naming; no invented names.",
  ].join("\n");

const PANTRY_TOP_TEMPLATE = (items: string[], count: number) =>
  [
    `User pantry items: ${items.join(", ")}`,
    `Goal: recommend ${count} cocktails that best match the pantry (fewest missing ingredients).`,
    "For each pick, give ONE short reason, and (optional) list of 0-3 missing ingredients.",
    "Prefer classics in TheCocktailDB naming; no invented names.",
  ].join("\n");


const VIBE_SCHEMA = {
  name: "vibe_recs",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intent", "settledWords", "cocktails"],
    properties: {
      intent: { type: "string", enum: ["recommend"] },
      settledWords: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 3,
      },
      cocktails: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "why"],
          properties: {
            name: { type: "string", description: "Standard cocktail name in TheCocktailDB" },
            why: { type: "string" },
            zeroProofTwin: { type: "string" },
          },
        },
      },
      oneLineCoaching: { type: "string" }, 
      swaps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["have", "use"],
          properties: {
            have: { type: "string" },
            use: { type: "string" },
            note: { type: "string" },
          },
        },
      },
    },
  },
} as const;


function makeSwapSchema(allowedHave: string[]) {
  return {
    name: "swap_simplify",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["intent", "swaps"],
      properties: {
        intent: { type: "string", enum: ["swap_simplify"] },
        swaps: {
          type: "array",
          minItems: 1,
          maxItems: Math.max(1, allowedHave.length),
          items: {
            type: "object",
            additionalProperties: false,
            required: ["have", "use"],
            properties: {
              have: { type: "string", enum: allowedHave },
              use: { type: "string" },
              note: { type: "string" },
            },
          },
        },
        oneLineCoaching: { type: "string" },
      },
    },
  } as const;
}

const INTRO_SCHEMA = {
  name: "vibe_intro",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intent", "intro"],
    properties: {
      intent: { type: "string", enum: ["intro"] },
      intro: { type: "string", description: "1-2 sentences, <= 45 words, plain text" },
    },
  },
} as const;

const RANK_FROM_PANTRY_SCHEMA = {
  name: "rank_from_pantry",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intent", "chosen"],
    properties: {
      intent: { type: "string", enum: ["rank_from_pantry"] },
      chosen: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "why"],
          properties: {
            name: { type: "string" },
            why: { type: "string" }, 
            missing: { 
              type: "array",
              items: { type: "string" },
              minItems: 0,
              maxItems: 3,
            },
          },
        },
      },
    },
  },
} as const;


const PANTRY_TOP_SCHEMA = {
  name: "pantry_top",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intent", "chosen"],
    properties: {
      intent: { type: "string", enum: ["pantry_top"] },
      chosen: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "why"],
          properties: {
            name: { type: "string" },
            why: { type: "string" },
            missing: {
              type: "array",
              items: { type: "string" },
              minItems: 0,
              maxItems: 3,
            },
          },
        },
      },
    },
  },
} as const;


export async function fetchAISuggestions({
  keywords,
  excludeNames = [],
  count = 5,
}: AIPayload): Promise<AISuggestion[]> {
  const words = normalizeWords(keywords);
  const res = await callChatJSON({
    system: SYSTEM_CORE,
    user: RECOMMEND_USER_TEMPLATE(words, count, excludeNames),
    schema: VIBE_SCHEMA,
  });

  if (!res || res.intent !== "recommend" || !Array.isArray(res.cocktails)) return [];
  return res.cocktails.slice(0, count).map((c: any) => ({
    name: c.name,
    reason: c.why ?? "",
  }));
}

export async function fetchSwapSimplify(
  base: string,
  ingredients: string[]
): Promise<AISwapResponse | null> {
  const baseTrim = (base || "").trim();
  const ingList = (ingredients || [])
    .map(s => (s || "").trim())
    .filter(Boolean);
  if (!baseTrim || ingList.length === 0) return null;
  const res = await callChatJSON({
    system: SYSTEM_CORE,
    user: SWAP_USER_TEMPLATE(baseTrim, ingList),
    schema: makeSwapSchema(ingList),
  });

  if (!res || res.intent !== "swap_simplify" || !Array.isArray(res.swaps) || res.swaps.length === 0) {
    return null;
  }
  return res as AISwapResponse;
}

export async function fetchVibeIntro(
  keywords: string[]
): Promise<string | null> {
  const words = normalizeWords(keywords);
  if (words.length === 0) return null;

  const res = await callChatJSON({
    system: SYSTEM_CORE,
    user: INTRO_USER_TEMPLATE(words),
    schema: INTRO_SCHEMA,
  });

  if (!res || res.intent !== "intro" || typeof res.intro !== "string") {
    return null;
  }
  const cleaned = res.intro.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

export async function rankCocktailsFromPantry(
  items: string[],
  candidateNames: string[],
  count = 3
): Promise<PantryPick[]> {
  const pantry = normalizeWords(items);
  const cands = (candidateNames || []).slice(0, 8);
  if (pantry.length === 0 || cands.length === 0) return [];

  const res = await callChatJSON({
    system: SYSTEM_CORE,
    user: RANK_FROM_PANTRY_TEMPLATE(pantry, cands, Math.min(Math.max(count, 1), 3)),
    schema: RANK_FROM_PANTRY_SCHEMA,
  });

  if (!res || res.intent !== "rank_from_pantry" || !Array.isArray(res.chosen)) return [];
  return res.chosen;
}

export async function topCocktailsFromPantryOnly(
  items: string[],
  count = 3
): Promise<PantryPick[]> {
  const pantry = normalizeWords(items);
  if (pantry.length === 0) return [];

  const res = await callChatJSON({
    system: SYSTEM_CORE,
    user: PANTRY_TOP_TEMPLATE(pantry, Math.min(Math.max(count, 1), 3)),
    schema: PANTRY_TOP_SCHEMA,
  });

  if (!res || res.intent !== "pantry_top" || !Array.isArray(res.chosen)) return [];
  return res.chosen;
}

async function callChatJSON({
  system,
  user,
  schema,
}: {
  system: string;
  user: string;
  schema: any;
}): Promise<any | null> {

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const payload = {
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: schema },
  };

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(to);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`OpenAI HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const content: string =
      data?.choices?.[0]?.message?.content ??
      data?.output ??
      "";

    const parsed = safeJson(content);
    return parsed;
  } catch (err) {
    clearTimeout(to);
    console.warn("AI error:", err);
    return null;
  }
}

function normalizeWords(arr: string[]): string[] {
  return (arr || [])
    .join(",")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function safeJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {}
  const match = text.match(/\{[\s\S]*\}$/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}