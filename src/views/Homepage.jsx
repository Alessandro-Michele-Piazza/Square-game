import { useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import Gamelist from "../components/Gamelist";
import "../css/views/CatalogPage.css";

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

function normalizeCatalogGame(game, index) {
  const genres = Array.isArray(game?.genres)
    ? game.genres
        .map((genre) => genre?.name)
        .filter(Boolean)
    : [];

  const parentPlatforms = Array.isArray(game?.parent_platforms)
    ? game.parent_platforms
        .map((item) => item?.platform?.name)
        .filter(Boolean)
    : [];

  const directPlatforms = Array.isArray(game?.platforms)
    ? game.platforms
        .map((item) => item?.platform?.name)
        .filter(Boolean)
    : [];

  const metacriticValue = Number(game?.metacritic);

  return {
    // Catalog schema example:
    // { id, name, genre, platform, metacriticScore, image }
    id: Number(game?.id ?? index),
    name: String(game?.name ?? "Titolo sconosciuto"),
    genre: Array.from(new Set(genres)),
    platform: Array.from(new Set([...parentPlatforms, ...directPlatforms])),
    metacriticScore: Number.isFinite(metacriticValue) ? metacriticValue : 0,
    image: game?.background_image ?? "",
    rawGame: game,
  };
}

export default function Homepage() {
  const data = useLoaderData();
  const [currentPage, setCurrentPage] = useState(1);
  const hasMountedRef = useRef(false);

  const games = useMemo(() => {
    const uniqueGames = new Map();
    const rawGames = Array.isArray(data) ? data : [];

    rawGames.forEach((game, index) => {
      const key = buildDedupKey(game) || `game-${game?.id ?? index}`;
      const existing = uniqueGames.get(key);

      uniqueGames.set(key, existing ? pickBestGame(existing, game) : game);
    });

    return Array.from(uniqueGames.values());
  }, [data]);

  const gamesCatalog = useMemo(() => {
    return games.map((game, index) => normalizeCatalogGame(game, index));
  }, [games]);

  const totalPages = Math.max(1, Math.ceil(gamesCatalog.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedGames = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
    return gamesCatalog.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPageSafe, gamesCatalog]);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPagination = gamesCatalog.length > PAGE_SIZE;
  const isGamesEmpty = gamesCatalog.length === 0;

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
      <div className="catalog-page__header">
        <h1
          className="catalog-page__title"
          data-aos="fade-up"
        >
          Top Rated Games
        </h1>
      </div>

      {gamesCatalog.length === 0 && (
        <p className="catalog-page__empty">Nessun gioco trovato. Controlla la API key RAWG.</p>
      )}

      <Gamelist
        className={hasPagination ? "" : "gamelist--spaced-bottom"}
        isEmpty={isGamesEmpty}
      >
        {paginatedGames.map((game) => {
          return <Gamelist.Card key={game.id} game={game.rawGame} />;
        })}
      </Gamelist>

      {hasPagination && (
        <nav
          className="catalog-page__pagination"
          aria-label="Paginazione top games filtrati"
        >
          <button
            type="button"
            onClick={() => setCurrentPage((prevPage) => Math.max(1, Math.min(prevPage, totalPages) - 1))}
            disabled={currentPageSafe === 1}
            className="catalog-page__button"
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
                className={`catalog-page__button catalog-page__button--number ${isActive ? "is-active" : ""}`.trim()}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))}
            disabled={currentPageSafe === totalPages}
            className="catalog-page__button"
          >
            Next
          </button>

          <p className="catalog-page__summary">
            Pagina {currentPageSafe} di {totalPages}
          </p>
        </nav>
      )}
    </>
  );
}
