import { useContext, useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import {
  FaArrowUpRightFromSquare,
  FaBookmark,
  FaCalendarDays,
  FaDesktop,
  FaGamepad,
  FaHeart,
  FaMobileScreenButton,
  FaRegBookmark,
  FaRegHeart,
  FaStar,
} from "react-icons/fa6";
import { FaPlaystation, FaSteam, FaXbox } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import Navbar from "../components/Navbar";
import GameCarousel from "../components/GameCarousel";
import BodySection from "../components/BodySection";
import { UserContext } from "../context/user-context";
import supabase from "../database/supabase";
import useAos from "../hooks/useAos";
import useRouteScrollReset from "../hooks/useRouteScrollReset";
import routes from "../router/routes";
import "../css/views/DetailPage.css";

const fallbackImage =
  "https://placehold.co/1400x900/081120/e2e8f0?text=No+Image";

function formatDate(value) {
  if (!value) {
    return "Data non disponibile";
  }

  return new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFilterItems(
  items,
  getName = (item) => item?.name,
  getSlug = (item) => item?.slug,
  getId = (item) => item?.id,
) {
  return (items ?? [])
    .map((item) => {
      const name = getName(item);
      const slug = getSlug(item) ?? slugify(name);
      const id = getId(item) ?? slug;

      if (!name || !slug || !id) {
        return null;
      }

      return { id, name, slug };
    })
    .filter(Boolean);
}

function formatCount(value) {
  if (typeof value !== "number") {
    return "0";
  }

  return new Intl.NumberFormat("it-IT").format(value);
}

function getPlatformIcon(platformName) {
  const normalized = String(platformName ?? "").toLowerCase();

  if (normalized.includes("playstation") || normalized.includes("sony")) {
    return <FaPlaystation />;
  }

  if (normalized.includes("nintendo")) {
    return <BsNintendoSwitch />;
  }

  if (normalized.includes("xbox")) {
    return <FaXbox />;
  }

  if (normalized.includes("steam")) {
    return <FaSteam />;
  }

  if (
    normalized.includes("pc") ||
    normalized.includes("windows") ||
    normalized.includes("mac")
  ) {
    return <FaDesktop />;
  }

  if (
    normalized.includes("android") ||
    normalized.includes("ios") ||
    normalized.includes("mobile")
  ) {
    return <FaMobileScreenButton />;
  }

  return <FaGamepad />;
}

function DetailLinks({ items, emptyLabel, toBuilder, iconForItem }) {
  if (!items.length) {
    return <span className="detail-links-empty">{emptyLabel}</span>;
  }

  return (
    <div className="detail-links-list">
      {items.map((item) => (
        <Link
          key={`${item.id}-${item.slug}`}
          to={toBuilder(item)}
          className="detail-links-item"
        >
          {iconForItem && (
            <span className="detail-links-icon">
              {iconForItem(item)}
            </span>
          )}
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default function DetailPage() {
  const data = useLoaderData();
  const game = data?.game ?? null;
  const trailers = Array.isArray(data?.trailers) ? data.trailers : [];
  const screenshots = Array.isArray(data?.screenshots) ? data.screenshots : [];
  const navigate = useNavigate();
  useAos();
  useRouteScrollReset();

  const { user } = useContext(UserContext);
  const ownerId = user?.id ?? null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [isWantToPlay, setIsWantToPlay] = useState(false);
  const [wantToPlayLoading, setWantToPlayLoading] = useState(false);

  useEffect(() => {
    if (!ownerId || !game?.id) {
      setIsFavorite(false);
      setIsWantToPlay(false);
      return;
    }

    const checkCollections = async () => {
      const [favoriteResult, wantToPlayResult] = await Promise.all([
        supabase
          .from("favorites")
          .select("id")
          .eq("profile_id", ownerId)
          .eq("game_id", game.id)
          .maybeSingle(),
        supabase
          .from("want_to_play")
          .select("id")
          .eq("profile_id", ownerId)
          .eq("game_id", game.id)
          .maybeSingle(),
      ]);

      const { data: favorite, error: favoriteError } = favoriteResult;
      const { data: wanted, error: wantedError } = wantToPlayResult;

      if (favoriteError) {
        console.error("Favorite check error:", favoriteError);
      } else {
        setIsFavorite(Boolean(favorite));
      }

      if (wantedError) {
        console.error("Want to play check error:", wantedError);
      } else {
        setIsWantToPlay(Boolean(wanted));
      }
    };

    void checkCollections();
  }, [game?.id, ownerId]);

  const toggleFavorite = async () => {
    if (!ownerId || !game?.id || favLoading) {
      return;
    }

    setFavLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("profile_id", ownerId)
          .eq("game_id", game.id);

        if (error) {
          console.error("Favorite delete error:", error);
        } else {
          setIsFavorite(false);
        }

        return;
      }

      const { error } = await supabase.from("favorites").insert({
        profile_id: ownerId,
        game_id: Number(game.id),
        game_name: game.name,
      });

      if (error) {
        console.error("Favorite insert error:", error);
      } else {
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    } finally {
      setFavLoading(false);
    }
  };

  const toggleWantToPlay = async () => {
    if (!ownerId || !game?.id || wantToPlayLoading) {
      return;
    }

    setWantToPlayLoading(true);

    try {
      if (isWantToPlay) {
        const { error } = await supabase
          .from("want_to_play")
          .delete()
          .eq("profile_id", ownerId)
          .eq("game_id", game.id);

        if (error) {
          console.error("Want to play delete error:", error);
        } else {
          setIsWantToPlay(false);
        }

        return;
      }

      const { error } = await supabase.from("want_to_play").insert({
        profile_id: ownerId,
        game_id: Number(game.id),
        game_name: game.name,
      });

      if (error) {
        console.error("Want to play insert error:", error);
      } else {
        setIsWantToPlay(true);
      }
    } catch (error) {
      console.error("Want to play toggle error:", error);
    } finally {
      setWantToPlayLoading(false);
    }
  };

  if (!game?.id) {
    return (
      <div className="detail-fallback">
        <Navbar sticky={false} />
        <main className="detail-fallback-main" data-aos="fade-up">
          <h1 className="detail-fallback-title">
            Scheda gioco non disponibile
          </h1>
          <p className="detail-fallback-text">
            Non sono riuscito a recuperare i dati del gioco. Controlla la API
            key RAWG o prova a ricaricare la pagina.
          </p>
          <div className="detail-fallback-actions">
            <button
              onClick={() => navigate(-1)}
              className="detail-link"
              data-text="Torna indietro"
            >
              Torna indietro
              <span className="detail-link__hover" aria-hidden="true">
                Torna indietro
              </span>
            </button>
            <Link to={routes.home} className="detail-link" data-text="Vai alla home">
              Vai alla home
              <span className="detail-link__hover" aria-hidden="true">
                Vai alla home
              </span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const heroImage =
    game?.background_image ||
    game?.background_image_additional ||
    fallbackImage;
  const accentImage = game?.background_image_additional || heroImage;
  const genres = getFilterItems(game?.genres);
  const platforms = getFilterItems(
    game?.platforms,
    (entry) => entry.platform?.name,
    (entry) => entry.platform?.slug,
    (entry) => entry.platform?.id,
  );
  const developers = getFilterItems(game?.developers);
  const publishers = getFilterItems(game?.publishers);

  const releaseDate = formatDate(game?.released);
  const metacritic = game?.metacritic ?? "-";
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "-";
  const ratingsCount = formatCount(game?.ratings_count);

  return (
    <div className="detail-page">
      <div className="detail-page__backdrop">
        <img
          src={accentImage}
          alt=""
          className="detail-page__backdrop-image"
        />
        <div className="detail-page__backdrop-overlay" />
      </div>

      <Navbar sticky={false} />

      <main className="detail-page__main">
        <div className="detail-page__orb" />

        <section className="detail-page__content" data-aos="fade-up">
          <div className="detail-page__actions" data-aos="fade-up" data-aos-delay="60">
            <button
              onClick={() => navigate(-1)}
              className="detail-link"
              data-text="Torna indietro"
            >
              Torna indietro
              <span className="detail-link__hover" aria-hidden="true">
                Torna indietro
              </span>
            </button>

            <div className="detail-page__actions-group">
              <Link
                to={routes.home}
                className="detail-link"
                data-text="Collezione giochi"
              >
                Collezione giochi
                <span className="detail-link__hover" aria-hidden="true">
                  Collezione giochi
                </span>
              </Link>
            </div>
          </div>

          <div className="detail-page__grid" data-aos="fade-up" data-aos-delay="100">
            <section className="detail-page__media" data-aos="fade-right" data-aos-delay="140">
              <GameCarousel
                screenshots={screenshots}
                trailers={trailers}
                fallbackImage={heroImage}
                title={game?.name}
              />

              <dl className="detail-page__stats">
                <div>
                  <dt className="detail-page__stat-label">
                    Metacritic
                  </dt>
                  <dd className="detail-page__stat-value detail-page__stat-value--icon">
                    <FaStar className="detail-page__stat-star" />
                    {metacritic}
                  </dd>
                </div>
                <div>
                  <dt className="detail-page__stat-label">
                    Reviews
                  </dt>
                  <dd className="detail-page__stat-value">
                    {ratingsCount}
                  </dd>
                </div>
                <div className="detail-page__genre-block">
                  <dt className="detail-page__stat-label">
                    Generi
                  </dt>
                  {genres.length > 0 ? (
                    <div className="detail-page__genre-links">
                      {genres.map((genre) => (
                        <Link
                          key={genre.slug}
                          to={`/genre/${genre.slug}`}
                          className="detail-page__genre-link"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="detail-page__meta-empty">
                      Non disponibili
                    </span>
                  )}
                </div>
              </dl>

              <div className="detail-page__cta-row">
                {game?.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glow btn-glow--yellow btn-glow--no-reflect"
                  >
                    Visita sito ufficiale
                    <FaArrowUpRightFromSquare className="detail-page__cta-icon" />
                  </a>
                )}
              </div>
            </section>

            <section className="detail-page__info" data-aos="fade-left" data-aos-delay="160">
              <h1 className="detail-page__title">
                {game?.name || "Titolo sconosciuto"}
              </h1>

              <div className="detail-page__meta-row">
                <span className="detail-page__meta-item">
                  <FaCalendarDays className="detail-page__meta-icon" />
                  Release: {releaseDate}
                </span>
                <span className="detail-page__meta-item">
                  <FaGamepad className="detail-page__meta-icon" />
                  Rating: {rating}
                </span>
              </div>

              <p className="detail-page__description">
                {game?.description_raw || "Descrizione non disponibile"}
              </p>

              <div className="detail-page__collection-actions">
                {ownerId && (
                  <>
                    <button
                      onClick={toggleFavorite}
                      disabled={favLoading}
                      className="detail-page__collection-btn detail-page__collection-btn--favorite"
                    >
                      {isFavorite ? (
                        <FaHeart className="detail-page__icon detail-page__icon--favorite-active" />
                      ) : (
                        <FaRegHeart className="detail-page__icon detail-page__icon--favorite" />
                      )}
                      {favLoading
                        ? "Attendere..."
                        : isFavorite
                          ? "Nei preferiti"
                          : "Aggiungi ai preferiti"}
                    </button>

                    <button
                      onClick={toggleWantToPlay}
                      disabled={wantToPlayLoading}
                      className="detail-page__collection-btn detail-page__collection-btn--want"
                    >
                      {isWantToPlay ? (
                        <FaBookmark className="detail-page__icon detail-page__icon--want-active" />
                      ) : (
                        <FaRegBookmark className="detail-page__icon detail-page__icon--want" />
                      )}
                      {wantToPlayLoading
                        ? "Attendere..."
                        : isWantToPlay
                          ? "In Want to play"
                          : "Aggiungi a Want to play"}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>

          <section className="detail-page__cards" data-aos="fade-up" data-aos-delay="200">
            <article className="detail-page__card" data-aos="zoom-in" data-aos-delay="240">
              <h2 className="detail-page__card-title">
                <FaGamepad className="detail-page__card-title-icon" />
                Piattaforme
              </h2>
              <DetailLinks
                items={platforms}
                emptyLabel="Nessuna piattaforma disponibile"
                iconForItem={(platform) => getPlatformIcon(platform.name)}
                toBuilder={(platform) =>
                  `/platform/${platform.id}/${platform.slug}`
                }
              />
            </article>

            <article className="detail-page__card" data-aos="zoom-in" data-aos-delay="280">
              <h2 className="detail-page__card-title">
                Developers
              </h2>
              <DetailLinks
                items={developers}
                emptyLabel="Non disponibili"
                toBuilder={(developer) => `/developer/${developer.slug}`}
              />
            </article>

            <article className="detail-page__card" data-aos="zoom-in" data-aos-delay="320">
              <h2 className="detail-page__card-title">
                Publishers
              </h2>
              <DetailLinks
                items={publishers}
                emptyLabel="Non disponibili"
                toBuilder={(publisher) => `/publisher/${publisher.slug}`}
              />
            </article>
          </section>

          <div className="detail-page__reviews-wrap" data-aos="fade-up" data-aos-delay="360">
            <BodySection game={game} />
          </div>
        </section>
      </main>
    </div>
  );
}
