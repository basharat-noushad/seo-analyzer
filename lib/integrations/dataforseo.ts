/**
 * DataForSEO API Client
 *
 * Provides keyword suggestion data from the DataForSEO API.
 * Falls back to simulated data when DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD
 * environment variables are not set.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeywordResult {
  keyword: string;
  searchVolume: number;
  competition: number; // 0-1
  cpc: number;
  trend: number[]; // monthly search volumes (last 12 months)
}

export interface KeywordSuggestionsResponse {
  keywords: KeywordResult[];
  dataSource: "live" | "simulated";
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const isConfigured = Boolean(DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getKeywordSuggestions(
  seedKeyword: string,
  country: string = "US"
): Promise<KeywordSuggestionsResponse> {
  if (!isConfigured) {
    return {
      keywords: simulateKeywordSuggestions(seedKeyword),
      dataSource: "simulated",
    };
  }

  return fetchLiveKeywordSuggestions(seedKeyword, country);
}

// ---------------------------------------------------------------------------
// Live API implementation
// ---------------------------------------------------------------------------

async function fetchLiveKeywordSuggestions(
  seedKeyword: string,
  country: string
): Promise<KeywordSuggestionsResponse> {
  const url =
    "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live";

  const credentials = Buffer.from(
    `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
  ).toString("base64");

  const body = [
    {
      keywords: [seedKeyword],
      location_code: getLocationCode(country),
      language_code: "en",
    },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `DataForSEO API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const results: KeywordResult[] = [];
  const tasks = data?.tasks ?? [];

  for (const task of tasks) {
    const taskResult = task?.result ?? [];
    for (const item of taskResult) {
      results.push({
        keyword: item.keyword ?? "",
        searchVolume: item.search_volume ?? 0,
        competition: item.competition ?? 0,
        cpc: item.cpc ?? 0,
        trend: (item.monthly_searches ?? []).map(
          (m: { search_volume?: number }) => m.search_volume ?? 0
        ),
      });
    }
  }

  return { keywords: results, dataSource: "live" };
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

function simulateKeywordSuggestions(seedKeyword: string): KeywordResult[] {
  const seed = seedKeyword.toLowerCase().trim();
  const prefixes = ["best", "top", "how to", "what is", "free", "cheap", ""];
  const suffixes = [
    "tool",
    "software",
    "guide",
    "tips",
    "examples",
    "services",
    "online",
    "for beginners",
    "2024",
    "",
  ];

  const keywords: KeywordResult[] = [];

  // Generate the seed keyword itself
  keywords.push(generateSimulatedKeyword(seed, 0));

  // Generate variations
  for (let i = 0; i < 15; i++) {
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[i % suffixes.length];
    const kw = [prefix, seed, suffix].filter(Boolean).join(" ");

    if (kw !== seed) {
      keywords.push(generateSimulatedKeyword(kw, i + 1));
    }
  }

  return keywords;
}

function generateSimulatedKeyword(keyword: string, index: number): KeywordResult {
  // Generate deterministic but realistic-looking values based on keyword hash
  const hash = simpleHash(keyword);
  const baseVolume = ((hash % 9000) + 100) * (index === 0 ? 10 : 1);
  const searchVolume = Math.max(10, Math.round(baseVolume / 10) * 10);
  const competition = Math.round(((hash % 100) / 100) * 100) / 100;
  const cpc = Math.round(((hash % 500) / 100) * 100) / 100;

  // Generate a trend (12 months of simulated volumes)
  const trend: number[] = [];
  for (let m = 0; m < 12; m++) {
    const seasonalFactor = 1 + 0.2 * Math.sin((m / 12) * 2 * Math.PI);
    trend.push(Math.round(searchVolume * seasonalFactor));
  }

  return { keyword, searchVolume, competition, cpc, trend };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// Country -> location code mapping
// ---------------------------------------------------------------------------

function getLocationCode(country: string): number {
  const codes: Record<string, number> = {
    US: 2840,
    UK: 2826,
    GB: 2826,
    CA: 2124,
    AU: 2036,
    DE: 2276,
    FR: 2250,
    ES: 2724,
    IT: 2380,
    BR: 2076,
    IN: 2356,
    JP: 2392,
  };
  return codes[country.toUpperCase()] ?? 2840;
}
