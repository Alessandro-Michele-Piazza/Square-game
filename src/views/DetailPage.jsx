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
import "../components/GameCarousel.css";

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
    return <span className="text-sm text-[#94a3b8]">{emptyLabel}</span>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <Link
          key={`${item.id}-${item.slug}`}
          to={toBuilder(item)}
          className="inline-flex items-center gap-2 text-sm text-[#dbe6f7] transition-colors duration-200 hover:text-[#67e8f9]"
        >
          {iconForItem && (
            <span className="text-base text-[#67e8f9]">
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
      <div className="min-h-screen bg-[rgba(5,10,21,0.84)] text-white">
        <Navbar sticky={false} />
        <main className="mx-auto flex min-h-[72vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center" data-aos="fade-up">
          <h1 className="font-orbitron text-4xl font-black text-white">
            Scheda gioco non disponibile
          </h1>
          <p className="max-w-xl text-base leading-8 text-[#94a3b8]">
            Non sono riuscito a recuperare i dati del gioco. Controlla la API
            key RAWG o prova a ricaricare la pagina.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
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
            <Link to="/" className="detail-link" data-text="Vai alla home">
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[rgba(4,9,21,0.84)] text-[#e2e8f0]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)]">
        <img
          src={accentImage}
          alt=""
          className="h-full w-full scale-[1.02] object-cover opacity-28 blur-[4px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,21,0.05)_0%,rgba(4,9,21,0.58)_52%,rgba(4,9,21,0.9)_100%)]" />
      </div>

      <Navbar sticky={false} />

      <main className="relative z-10 overflow-hidden pb-16">
        <div className="absolute left-1/2 top-44 h-72 w-72 -translate-x-1/2 rounded-full bg-[#22d3ee]/10 blur-[120px]" />

        <section className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8" data-aos="fade-up">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4" data-aos="fade-up" data-aos-delay="60">
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

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
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

          <div className="grid gap-10 lg:grid-cols-[1.45fr_1.15fr] lg:items-start" data-aos="fade-up" data-aos-delay="100">
            <section data-aos="fade-right" data-aos-delay="140">
              <GameCarousel
                screenshots={screenshots}
                trailers={trailers}
                fallbackImage={heroImage}
                title={game?.name}
              />

              <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/10 pt-6 text-sm">
                <div>
                  <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[#94a3b8]">
                    Metacritic
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white">
                    <FaStar className="text-[#facc15]" />
                    {metacritic}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[#94a3b8]">
                    Reviews
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {ratingsCount}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-[#94a3b8]">
                    Generi
                  </dt>
                  {genres.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                      {genres.map((genre) => (
                        <Link
                          key={genre.slug}
                          to={`/genre/${genre.slug}`}
                          className="text-sm text-[#dbe6f7] transition-colors duration-200 hover:text-[#67e8f9]"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="mt-2 block text-sm text-[#94a3b8]">
                      Non disponibili
                    </span>
                  )}
                </div>
              </dl>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em] text-[#9fb1cc]">
                {game?.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glow btn-glow--yellow btn-glow--no-reflect"
                  >
                    Visita sito ufficiale
                    <FaArrowUpRightFromSquare className="text-xs" />
                  </a>
                )}
              </div>
            </section>

            <section className="lg:pt-0" data-aos="fade-left" data-aos-delay="160">
              <h1 className="font-orbitron text-4xl font-black leading-tight text-white sm:text-5xl">
                {game?.name || "Titolo sconosciuto"}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#a9b7cf]">
                <span className="inline-flex items-center gap-2">
                  <FaCalendarDays className="text-[#67e8f9]" />
                  Release: {releaseDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <FaGamepad className="text-[#67e8f9]" />
                  Rating: {rating}
                </span>
              </div>

              <p className="mt-6 text-sm leading-8 text-[#d1d9e8] sm:text-base">
                {game?.description_raw || "Descrizione non disponibile"}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {ownerId && (
                  <>
                    <button
                      onClick={toggleFavorite}
                      disabled={favLoading}
                      className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-[#dbe6f7] transition-all duration-300 hover:border-red-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isFavorite ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-red-300/80" />
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
                      className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-[#dbe6f7] transition-all duration-300 hover:border-amber-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isWantToPlay ? (
                        <FaBookmark className="text-amber-400" />
                      ) : (
                        <FaRegBookmark className="text-amber-200/90" />
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

          <section className="mt-8 grid gap-6 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="200">
            <article className="rounded-[24px] border border-white/10 bg-[#071121]/60 p-5 backdrop-blur-xl" data-aos="zoom-in" data-aos-delay="240">
              <h2 className="inline-flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-[#67e8f9]">
                <FaGamepad className="text-base" />
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

            <article className="rounded-[24px] border border-white/10 bg-[#071121]/60 p-5 backdrop-blur-xl" data-aos="zoom-in" data-aos-delay="280">
              <h2 className="font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-[#67e8f9]">
                Developers
              </h2>
              <DetailLinks
                items={developers}
                emptyLabel="Non disponibili"
                toBuilder={(developer) => `/developer/${developer.slug}`}
              />
            </article>

            <article className="rounded-[24px] border border-white/10 bg-[#071121]/60 p-5 backdrop-blur-xl" data-aos="zoom-in" data-aos-delay="320">
              <h2 className="font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-[#67e8f9]">
                Publishers
              </h2>
              <DetailLinks
                items={publishers}
                emptyLabel="Non disponibili"
                toBuilder={(publisher) => `/publisher/${publisher.slug}`}
              />
            </article>
          </section>

          <div className="mt-12" data-aos="fade-up" data-aos-delay="360">
            <BodySection game={game} />
          </div>
        </section>
      </main>
    </div>
  );
}
