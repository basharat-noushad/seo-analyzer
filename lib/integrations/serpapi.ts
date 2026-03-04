/**
 * SerpAPI Client
 *
 * Checks keyword rankings by querying search engine results via SerpAPI.
 * Falls back to simulated data when SERPAPI_KEY is not set.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RankResult {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
  dataSource: "live" | "simulated";
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const isConfigured = Boolean(SERPAPI_KEY);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function checkKeywordRank(
  keyword: string,
  domain: string,
  engine: string = "google",
  country: string = "us"
): Promise<RankResult> {
  if (!isConfigured) {
    return simulateRankResult(keyword, domain);
  }

  return fetchLiveRankResult(keyword, domain, engine, country);
}

// ---------------------------------------------------------------------------
// Live API implementation
// ---------------------------------------------------------------------------

async function fetchLiveRankResult(
  keyword: string,
  domain: string,
  engine: string,
  country: string
): Promise<RankResult> {
  const params = new URLSearchParams({
    api_key: SERPAPI_KEY!,
    engine,
    q: keyword,
    gl: country,
    num: "100",
  });

  const url = `https://serpapi.com/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `SerpAPI error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Search through organic results for the target domain
  const organicResults: {
    position: number;
    link?: string;
    title?: string;
    displayed_link?: string;
  }[] = data.organic_results ?? [];

  const normalizedDomain = normalizeDomain(domain);

  for (const result of organicResults) {
    const resultDomain = result.link
      ? normalizeDomain(new URL(result.link).hostname)
      : "";

    if (resultDomain === normalizedDomain || resultDomain.endsWith(`.${normalizedDomain}`)) {
      return {
        keyword,
        position: result.position,
        url: result.link || null,
        title: result.title || null,
        dataSource: "live",
      };
    }
  }

  // Domain not found in results
  return {
    keyword,
    position: null,
    url: null,
    title: null,
    dataSource: "live",
  };
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

function simulateRankResult(keyword: string, domain: string): RankResult {
  const hash = simpleHash(keyword + domain);

  // 75% chance of appearing in results
  const found = hash % 4 !== 0;

  if (!found) {
    return {
      keyword,
      position: null,
      url: null,
      title: null,
      dataSource: "simulated",
    };
  }

  const position = (hash % 100) + 1;
  const path = generateSimulatedPath(keyword);

  return {
    keyword,
    position,
    url: `https://${domain}${path}`,
    title: generateSimulatedTitle(keyword, domain),
    dataSource: "simulated",
  };
}

function generateSimulatedPath(keyword: string): string {
  const slug = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `/${slug}`;
}

function generateSimulatedTitle(keyword: string, domain: string): string {
  const capitalized = keyword
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const siteName = domain.replace(/^www\./, "").split(".")[0];
  const siteTitle = siteName.charAt(0).toUpperCase() + siteName.slice(1);

  return `${capitalized} - ${siteTitle}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
