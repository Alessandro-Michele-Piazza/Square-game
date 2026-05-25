import { useEffect, useRef } from "react";
import { useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import Gamelist from "../components/Gamelist";

function formatFilterHeading(pathname, slug) {
  const routeKey = pathname.split("/").filter(Boolean)[0] ?? "search";
  const labels = {
    search: "Search Results",
    genre: "Genere",
    developer: "Developer",
    publisher: "Publisher",
    platform: "Piattaforma",
  };
  const prettySlug = decodeURIComponent(slug ?? "").replace(/-/g, " ");

  if (routeKey === "search") {
    return `${labels.search} by "${prettySlug}"`;
  }

  return `${labels[routeKey] ?? "Filtro"}: "${prettySlug}"`;
}

function toPositiveInt(value, fallback = 1) {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function normalizeLoaderData(data) {
  if (Array.isArray(data)) {
    return {
      games: data,
      pagination: {
        page: 1,
        totalPages: 1,
        totalResults: data.length,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  if (data && Array.isArray(data.games)) {
    const totalPages = toPositiveInt(data.pagination?.totalPages, 1);
    const totalResultsValue = Number(data.pagination?.totalResults);

    return {
      games: data.games,
      pagination: {
        page: Math.min(toPositiveInt(data.pagination?.page, 1), totalPages),
        totalPages,
        totalResults:
          Number.isFinite(totalResultsValue) && totalResultsValue >= 0
            ? totalResultsValue
            : data.games.length,
        hasNext: Boolean(data.pagination?.hasNext),
        hasPrevious: Boolean(data.pagination?.hasPrevious),
      },
    };
  }

  return {
    games: [],
    pagination: {
      page: 1,
      totalPages: 1,
      totalResults: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

function buildPageItems(totalPages, currentPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const windowStart = Math.max(2, currentPage - 2);
  const windowEnd = Math.min(totalPages - 1, currentPage + 2);

  if (windowStart > 2) {
    items.push("ellipsis-left");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }

  if (windowEnd < totalPages - 1) {
    items.push("ellipsis-right");
  }

  items.push(totalPages);

  return items;
}

function buildSearchWithPage(searchParams, page) {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (page <= 1) {
    nextSearchParams.delete("page");
  } else {
    nextSearchParams.set("page", String(page));
  }

  const search = nextSearchParams.toString();
  return search ? `?${search}` : "";
}

export default function Searchpage() {
  const data = useLoaderData();
  const { games, pagination } = normalizeLoaderData(data);
  const { slug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasMountedRef = useRef(false);

  const hasPagination = pagination.totalPages > 1;
  const pageItems = hasPagination
    ? buildPageItems(pagination.totalPages, pagination.page)
    : [];

  const goToPage = (nextPage) => {
    const safePage = Math.max(1, Math.min(nextPage, pagination.totalPages));

    navigate({
      pathname,
      search: buildSearchWithPage(searchParams, safePage),
    });
  };

  useEffect(() => {
    if (!hasPagination) {
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination.page, hasPagination]);

  return (
    <>
      <h1
        className="font-orbitron text-3xl font-bold text-center my-8 text-[#fef08a] drop-shadow-[0_0_18px_rgba(254,240,138,0.45)]"
        data-aos="fade-up"
      >
        {formatFilterHeading(pathname, slug)}
      </h1>
      {games.length === 0 && (
        <p className="text-center text-[#94a3b8]">
          Nessun gioco trovato per la tua ricerca.
        </p>
      )}
      <Gamelist className={hasPagination ? "" : "mb-14"}>
        {games.map((game) => {
          return <Gamelist.Card key={game.id} game={game} />;
        })}
      </Gamelist>

      {hasPagination && (
        <nav
          className="mx-auto mt-8 mb-4 flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-4"
          aria-label="Paginazione risultati filtrati"
        >
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!pagination.hasPrevious}
            className="rounded-lg border border-[#1e3a63] bg-[#081120] px-3 py-2 text-sm font-semibold text-[#93c5fd] transition hover:border-[#60a5fa] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {pageItems.map((pageItem, index) => {
            if (typeof pageItem !== "number") {
              return (
                <span
                  key={`${pageItem}-${index}`}
                  className="min-w-10 px-2 py-2 text-center text-sm font-semibold text-[#64748b]"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = pageItem === pagination.page;

            return (
              <button
                key={pageItem}
                type="button"
                onClick={() => goToPage(pageItem)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#fef08a] bg-[#fef08a] text-[#061024] shadow-[0_0_20px_rgba(254,240,138,0.28)]"
                    : "border-[#1e3a63] bg-[#081120] text-[#93c5fd] hover:border-[#60a5fa] hover:text-white"
                }`}
              >
                {pageItem}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="rounded-lg border border-[#1e3a63] bg-[#081120] px-3 py-2 text-sm font-semibold text-[#93c5fd] transition hover:border-[#60a5fa] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

          <p className="w-full text-center text-sm text-[#94a3b8]">
            Pagina {pagination.page} di {pagination.totalPages} - {pagination.totalResults} risultati
          </p>
        </nav>
      )}
    </>
  );
}
