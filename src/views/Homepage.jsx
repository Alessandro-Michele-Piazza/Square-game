import { useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import Gamelist from "../components/Gamelist";

const PAGE_SIZE = 12;

function buildDedupKey(game) {
  const source = String(game?.slug || game?.name || game?.id || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(\d{4}\)/g, "")
    .replace(/-\d{4}$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return source || String(game?.id || "");
}

function pickBestGame(currentGame, nextGame) {
  const currentHasImage = Boolean(currentGame?.background_image);
  const nextHasImage = Boolean(nextGame?.background_image);

  if (!currentHasImage && nextHasImage) {
    return nextGame;
  }

  if (currentHasImage === nextHasImage) {
    const currentScore = Number(currentGame?.metacritic ?? currentGame?.rating ?? -1);
    const nextScore = Number(nextGame?.metacritic ?? nextGame?.rating ?? -1);

    if (nextScore > currentScore) {
      return nextGame;
    }
  }

  return currentGame;
}

export default function Homepage() {
  const data = useLoaderData();
  const [currentPage, setCurrentPage] = useState(1);
  const hasMountedRef = useRef(false);

  const games = (() => {
    const uniqueGames = new Map();
    const rawGames = Array.isArray(data) ? data : [];

    rawGames.forEach((game, index) => {
      const key = buildDedupKey(game) || `game-${game?.id ?? index}`;
      const existing = uniqueGames.get(key);

      uniqueGames.set(key, existing ? pickBestGame(existing, game) : game);
    });

    return Array.from(uniqueGames.values());
  })();

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedGames = (() => {
    const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
    return games.slice(startIndex, startIndex + PAGE_SIZE);
  })();

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPagination = games.length > PAGE_SIZE;

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
  }, [currentPageSafe, hasPagination]);

  return (
    <>
      <h1
        className="font-orbitron text-3xl font-bold text-center my-8 text-[#fef08a] drop-shadow-[0_0_18px_rgba(254,240,138,0.45)]"
        data-aos="fade-up"
      >
        Top Rated Games
      </h1>
      {games.length === 0 && (
        <p className="text-center text-[#94a3b8]">Nessun gioco trovato. Controlla la API key RAWG.</p>
      )}
      <Gamelist className={hasPagination ? "" : "mb-14"}>
        {paginatedGames.map((game) => {
          return <Gamelist.Card key={game.id} game={game} />;
        })}
      </Gamelist>

      {hasPagination && (
        <nav
          className="mx-auto mt-8 mb-4 flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-4"
          aria-label="Paginazione top games"
        >
          <button
            type="button"
            onClick={() => setCurrentPage((prevPage) => Math.max(1, Math.min(prevPage, totalPages) - 1))}
            disabled={currentPageSafe === 1}
            className="rounded-lg border border-[#1e3a63] bg-[#081120] px-3 py-2 text-sm font-semibold text-[#93c5fd] transition hover:border-[#60a5fa] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {pageNumbers.map((pageNumber) => {
            const isActive = pageNumber === currentPageSafe;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#fef08a] bg-[#fef08a] text-[#061024] shadow-[0_0_20px_rgba(254,240,138,0.28)]"
                    : "border-[#1e3a63] bg-[#081120] text-[#93c5fd] hover:border-[#60a5fa] hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))}
            disabled={currentPageSafe === totalPages}
            className="rounded-lg border border-[#1e3a63] bg-[#081120] px-3 py-2 text-sm font-semibold text-[#93c5fd] transition hover:border-[#60a5fa] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

          <p className="w-full text-center text-sm text-[#94a3b8]">
            Pagina {currentPageSafe} di {totalPages}
          </p>
        </nav>
      )}
    </>
  );
}
