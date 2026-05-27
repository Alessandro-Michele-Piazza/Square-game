import { Link } from "react-router";
import "../css/components/GameCard.css";

const fallbackImage =
  "https://placehold.co/600x900/081120/e2e8f0?text=No+Image";

export default function Gamecard({ game }) {
  const safeName = game?.name || "Titolo sconosciuto";
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "–";
  const metacriticValue = Number(game?.metacritic);
  const metacritic = Number.isFinite(metacriticValue) ? metacriticValue : "–";
  const releaseYear = game?.released ? String(game.released).slice(0, 4) : "";
  const primaryGenre = Array.isArray(game?.genres)
    ? game.genres.find((genre) => Boolean(genre?.name))?.name
    : "";
  const primaryPlatform = Array.isArray(game?.parent_platforms)
    ? game.parent_platforms.find((item) => Boolean(item?.platform?.name))?.platform?.name
    : "";
  const cardDelay = (Number(game?.id ?? 0) % 8) * 35;
  const gameHref = `/detail/${game?.id}`;

  return (
    <article
      className="game-card"
      data-aos="fade-up"
      data-aos-delay={cardDelay}
    >
      <div className="game-card__frame">
        <Link
          to={gameHref}
          className="game-card__link"
          aria-label={safeName}
        >
          <img
            src={game?.background_image || fallbackImage}
            alt={game?.name || "Game cover"}
            className="game-card__image"
            loading="lazy"
            decoding="async"
            width="600"
            height="900"
          />
          <div className="game-card__overlay game-card__overlay--gradient" />
          <div className="game-card__overlay game-card__overlay--glow" />
          <div className="game-card__overlay game-card__overlay--scanline" />

          <div className="game-card__badges">
            <span className="game-card__badge game-card__badge--metacritic">
              ★ {metacritic}
            </span>
            <span className="game-card__badge game-card__badge--rating">
              ♥ {rating}
            </span>
            
          </div>
          
          <div className="game-card__content">
            
    <span className="game-card__title">{safeName}</span>
            <div className="game-card__meta">
              {primaryGenre && (
                <span className="game-card__chip game-card__chip--genre">{primaryGenre}</span>
              )}
              {primaryPlatform && (
                <span className="game-card__chip game-card__chip--platform">{primaryPlatform}</span>
              )}
              {releaseYear && (
                <span className="game-card__chip game-card__chip--year">{releaseYear}</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
