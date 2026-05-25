const FILTER_PAGE_SIZE = 20;

async function fetchGamesPayload(url) {
  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok || !Array.isArray(json.results)) {
    console.error("RAWG API error:", json);
    return null;
  }

  return json;
}

async function fetchGamesList(url) {
  const json = await fetchGamesPayload(url);

  if (!json) {
    return [];
  }

  return json.results;
}

function parsePageNumber(request) {
  if (!request?.url) {
    return 1;
  }

  try {
    const rawPage = new URL(request.url).searchParams.get("page");
    const parsedPage = Number.parseInt(rawPage ?? "1", 10);

    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      return 1;
    }

    return parsedPage;
  } catch {
    return 1;
  }
}

function parseMetacriticMin(request, fallback = 0) {
  if (!request?.url) {
    return fallback;
  }

  try {
    const rawMin = new URL(request.url).searchParams.get("metacriticMin");
    const parsedMin = Number.parseInt(rawMin ?? String(fallback), 10);

    if (Number.isNaN(parsedMin) || parsedMin < 0) {
      return fallback;
    }

    return Math.min(100, parsedMin);
  } catch {
    return fallback;
  }
}

function readSearchParam(request, key) {
  if (!request?.url) {
    return "";
  }

  try {
    return String(new URL(request.url).searchParams.get(key) ?? "").trim();
  } catch {
    return "";
  }
}

function parseOptionalGenreSlug(request) {
  return readSearchParam(request, "genre");
}

function parseOptionalPlatformId(request) {
  const rawPlatform = readSearchParam(request, "platform");
  const parsedPlatform = Number.parseInt(rawPlatform, 10);

  if (Number.isNaN(parsedPlatform) || parsedPlatform < 1) {
    return null;
  }

  return parsedPlatform;
}

function buildSecondaryFiltersQuerySegment(
  request,
  { includeGenre = true, includePlatform = true } = {},
) {
  const queryParts = [];

  if (includeGenre) {
    const genreSlug = parseOptionalGenreSlug(request);

    if (genreSlug) {
      queryParts.push(`genres=${encodeURIComponent(genreSlug)}`);
    }
  }

  if (includePlatform) {
    const platformId = parseOptionalPlatformId(request);

    if (platformId) {
      queryParts.push(`platforms=${platformId}`);
    }
  }

  if (queryParts.length === 0) {
    return "";
  }

  return `&${queryParts.join("&")}`;
}

function buildMetacriticQuerySegment(request, baseMin = 0) {
  const requestedMin = parseMetacriticMin(request, 0);
  const safeBaseMin = Math.max(0, Math.min(100, Number(baseMin) || 0));
  const effectiveMin = Math.max(safeBaseMin, requestedMin);

  if (effectiveMin <= 0) {
    return "";
  }

  return `&metacritic=${effectiveMin},100`;
}

function buildPaginatedResult(json, page, pageSize = FILTER_PAGE_SIZE) {
  const results = Array.isArray(json?.results) ? json.results : [];
  const count = Number.isFinite(Number(json?.count))
    ? Number(json.count)
    : results.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    games: results,
    pagination: {
      page: Math.max(1, Math.min(page, totalPages)),
      pageSize,
      totalResults: Math.max(0, count),
      totalPages,
      hasNext: Boolean(json?.next),
      hasPrevious: Boolean(json?.previous),
    },
  };
}

async function fetchPaginatedGames(url, request, pageSize = FILTER_PAGE_SIZE) {
  const requestedPage = parsePageNumber(request);
  const pagedUrl = `${url}&page_size=${pageSize}&page=${requestedPage}`;
  const json = await fetchGamesPayload(pagedUrl);

  if (!json) {
    return buildPaginatedResult({ results: [], count: 0, next: null, previous: null }, 1, pageSize);
  }

  const totalResults = Number.isFinite(Number(json.count))
    ? Number(json.count)
    : json.results.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  if (requestedPage > totalPages && totalResults > 0) {
    const fallbackUrl = `${url}&page_size=${pageSize}&page=${totalPages}`;
    const fallbackJson = await fetchGamesPayload(fallbackUrl);

    if (fallbackJson) {
      return buildPaginatedResult(fallbackJson, totalPages, pageSize);
    }
  }

  return buildPaginatedResult(json, requestedPage, pageSize);
}

async function getFilteredGames(filterKey, slug, request, options = {}) {
  const metacriticQuerySegment = buildMetacriticQuerySegment(request);
  const secondaryFiltersQuerySegment = buildSecondaryFiltersQuerySegment(request, options);

  return fetchPaginatedGames(
    `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_KEY}&${filterKey}=${encodeURIComponent(String(slug))}${secondaryFiltersQuerySegment}${metacriticQuerySegment}`,
    request,
  );
}

function hasFilteredMatches(payload) {
  return Number(payload?.pagination?.totalResults ?? 0) > 0;
}

export async function getAllGamesLoader({ request }) {
  const metacriticQuerySegment = buildMetacriticQuerySegment(request, 85);

  return fetchGamesList(
    `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_KEY}${metacriticQuerySegment}&ordering=-metacritic&page_size=40`,
  );
}

export async function getAuthHeroImageLoader() {
  const games = await fetchGamesList(
    `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_KEY}&metacritic=90,100&ordering=-metacritic&page_size=50`,
  );

  const imagePool = games
    .map((game) => game?.background_image)
    .filter(Boolean);

  if (imagePool.length === 0) {
    return { bgImage: null };
  }

  return {
    bgImage: imagePool[Math.floor(Math.random() * imagePool.length)],
  };
}

export async function getSearchedGames({ params, request }) {
  const metacriticQuerySegment = buildMetacriticQuerySegment(request);
  const secondaryFiltersQuerySegment = buildSecondaryFiltersQuerySegment(request);

  return fetchPaginatedGames(
    `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_KEY}&search=${encodeURIComponent(String(params.slug ?? ""))}${secondaryFiltersQuerySegment}${metacriticQuerySegment}`,
    request,
  );
}

export async function getAllGenres() {
  const promise = await fetch(
    `https://api.rawg.io/api/genres?key=${import.meta.env.VITE_RAWG_KEY}`,
  );
  const json = await promise.json();
  if (!promise.ok || !Array.isArray(json.results)) {
    console.error("RAWG API error:", json);
    return [];
  }
  return json.results;
}

export async function getFilteredbyGenreGames({ params, request }) {
  return getFilteredGames("genres", params.slug, request, {
    includeGenre: false,
  });
}

export async function getFilteredByDeveloperGames({ params, request }) {
  return getFilteredGames("developers", params.slug, request);
}

export async function getFilteredByPublisherGames({ params, request }) {
  return getFilteredGames("publishers", params.slug, request);
}

export async function getFilteredByPlatformGames({ params, request }) {
  const byPlatformId = await getFilteredGames("platforms", params.id, request, {
    includePlatform: false,
  });

  // Card badges often use RAWG parent platform ids (for example PlayStation = 2),
  // which are not resolved by `platforms=id`.
  if (hasFilteredMatches(byPlatformId)) {
    return byPlatformId;
  }

  const byParentPlatformId = await getFilteredGames("parent_platforms", params.id, request, {
    includePlatform: false,
  });

  if (hasFilteredMatches(byParentPlatformId)) {
    return byParentPlatformId;
  }

  return getFilteredGames("parent_platforms", params.slug, request, {
    includePlatform: false,
  });
}


export async function getGameDetails({ params }) {
  const promise = await fetch(
    `https://api.rawg.io/api/games/${params.id}?key=${import.meta.env.VITE_RAWG_KEY}`,
  );
  const json = await promise.json();
  if (!promise.ok) {
    console.error("RAWG API error:", json);
    return null;
  }
  return json;
}

// Loader combinato per la DetailPage minimal/futuristica
export async function getGameFullDetails({ params }) {
  // Dettagli gioco
  const detailsPromise = fetch(
    `https://api.rawg.io/api/games/${params.id}?key=${import.meta.env.VITE_RAWG_KEY}`
  ).then((r) => r.json());
  // Trailer
  const trailersPromise = fetch(
    `https://api.rawg.io/api/games/${params.id}/movies?key=${import.meta.env.VITE_RAWG_KEY}`
  ).then((r) => r.json());
  // Screenshot
  const screenshotsPromise = fetch(
    `https://api.rawg.io/api/games/${params.id}/screenshots?key=${import.meta.env.VITE_RAWG_KEY}`
  ).then((r) => r.json());

  const [game, trailers, screenshots] = await Promise.all([
    detailsPromise,
    trailersPromise,
    screenshotsPromise,
  ]);

  return {
    game,
    trailers: Array.isArray(trailers?.results) ? trailers.results : [],
    screenshots: Array.isArray(screenshots?.results) ? screenshots.results : [],
  };
}

export async function getGameTrailers({ params }) {
  const promise = await fetch(
    `https://api.rawg.io/api/games/${params.id}/movies?key=${import.meta.env.VITE_RAWG_KEY}`,
  );
  const json = await promise.json();
  if (!promise.ok || !Array.isArray(json.results)) {
    console.error("RAWG API error:", json);
    return [];
  }
  return json.results;
}

export async function getGameScreenshots({ params }) {
  const promise = await fetch(
    `https://api.rawg.io/api/games/${params.id}/screenshots?key=${import.meta.env.VITE_RAWG_KEY}`,
  );
  const json = await promise.json();
  if (!promise.ok || !Array.isArray(json.results)) {
    console.error("RAWG API error:", json);
    return [];
  }
  return json.results;
}

export async function getGameStores({ params }) {
  const promise = await fetch(
    `https://api.rawg.io/api/games/${params.id}/stores?key=${import.meta.env.VITE_RAWG_KEY}`,
  );
  const json = await promise.json();
  if (!promise.ok || !Array.isArray(json.results)) {
    console.error("RAWG API error:", json);
    return [];
  }
  return json.results;
}

