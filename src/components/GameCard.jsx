import { Link } from "react-router";
import "../css/components/GameCard.css";

const fallbackImage =
  "https://placehold.co/600x900/081120/e2e8f0?text=No+Image";

export default function Gamecard({ game }) {
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "–";
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
          aria-label={game?.name || "Titolo sconosciuto"}
        >
          <img
            src={game?.background_image || fallbackImage}
            alt={game?.name || "Game cover"}
            className="game-card__image"
          />
          <div className="game-card__overlay game-card__overlay--gradient" />
          <div className="game-card__overlay game-card__overlay--glow" />

          <div className="game-card__badges">
            <span className="game-card__badge game-card__badge--metacritic">
              ★ {game?.metacritic ?? "–"}
            </span>
            <span className="game-card__badge game-card__badge--rating">
              ♥ {rating}
            </span>
          </div>

          <div className="game-card__content">
            <span className="game-card__title">
              {game?.name || "Titolo sconosciuto"}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}
