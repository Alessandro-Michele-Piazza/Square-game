import { Link, useLoaderData, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import {
  FaArrowUpRightFromSquare,
  FaCalendarDays,
  FaGamepad,
  FaGlobe,
  FaStar,
} from "react-icons/fa6";

import { useContext } from "react";
import { UserContext } from "../context/user-context";
import BodySection from "../components/BodySection";


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

export default function DetailPage() {
  const game = useLoaderData();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const heroImage = game?.background_image || fallbackImage;
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
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "–";
  const ratingsCount =
    typeof game?.ratings_count === "number"
      ? new Intl.NumberFormat("it-IT").format(game.ratings_count)
      : "0";
  const infoCards = [
    {
      label: "Metacritic",
      value: game?.metacritic ?? "–",
      icon: <FaStar className="text-[#fef08a]" />,
    },
    {
      label: "Rating medio",
      value: rating,
      icon: <FaGamepad className="text-[#7dd3fc]" />,
    },
    {
      label: "Recensioni",
      value: ratingsCount,
      icon: <FaGlobe className="text-[#f59e0b]" />,
    },
    {
      label: "Uscita",
      value: releaseDate,
      icon: <FaCalendarDays className="text-[#c084fc]" />,
    },
  ];

  if (!game) {
    return (
      <div className="min-h-screen bg-[#050a15] text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#7dd3fc]">
            Game dossier
          </span>
          <h1 className="font-orbitron text-4xl font-black text-white">
            Scheda gioco non disponibile
          </h1>
          <p className="max-w-xl text-base leading-8 text-[#94a3b8]">
            Non sono riuscito a recuperare i dati del gioco. Controlla la API
            key RAWG o prova a ricaricare la pagina.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="detail-link"
              data-text="← Torna indietro"
            >
              ← Torna indietro
              <span className="detail-link__hover" aria-hidden="true">
                ← Torna indietro
              </span>
            </button>
            <Link to="/" className="detail-link" data-text="Torna alla home →">
              Torna alla home →
              <span className="detail-link__hover" aria-hidden="true">
                Torna alla home →
              </span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a15] text-white">
      <Navbar />

      <main className="relative isolate overflow-hidden pb-16">
        <div className="absolute inset-x-0 top-0 h-[34rem] overflow-hidden">
          <img
            src={accentImage}
            alt=""
            className="h-full w-full object-cover opacity-30 blur-[2px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,21,0.3)_0%,rgba(5,10,21,0.82)_58%,#050a15_100%)]" />
        </div>
        <div className="absolute left-1/2 top-36 h-80 w-80 -translate-x-1/2 rounded-full bg-[#38bdf8]/14 blur-[140px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="detail-link"
              data-text="← Torna indietro"
            >
              ← Torna indietro
              <span className="detail-link__hover" aria-hidden="true">
                ← Torna indietro
              </span>
            </button>
            <Link
              to="/"
              className="detail-link"
              data-text="Torna alla collezione →"
            >
              Torna alla collezione →
              <span className="detail-link__hover" aria-hidden="true">
                Torna alla collezione →
              </span>
            </Link>
          </div>

          <section className="grid gap-8 lg:grid-cols-[minmax(320px,430px)_1fr] lg:items-start">
            <article className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#071121]/75 shadow-[0_30px_90px_rgba(5,10,21,0.45)] backdrop-blur-xl">
              <img
                src={heroImage}
                alt={game?.name || "Game cover"}
                className="h-[420px] w-full object-cover lg:h-[620px]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,21,0.02)_15%,rgba(5,10,21,0.78)_100%)]" />

              <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
                <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-[#e2e8f0] backdrop-blur-md">
                  {genres[0]?.name || "Featured title"}
                </span>
                <div className="flex gap-2">
                  <span className="rounded-full border border-[#fef08a]/35 bg-[#fef08a]/10 px-3 py-1 text-xs font-semibold text-[#fef08a] backdrop-blur-md">
                    ★ {game?.metacritic ?? "–"}
                  </span>
                  <span className="rounded-full border border-[#38bdf8]/35 bg-[#38bdf8]/10 px-3 py-1 text-xs font-semibold text-[#7dd3fc] backdrop-blur-md">
                    ♥ {rating}
                  </span>
                </div>
              </div>

              <div className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2">
                {genres.length > 0 ? (
                  genres.slice(0, 3).map((genre) => (
                    <Link
                      key={genre.slug}
                      to={`/genre/${genre.slug}`}
                      className="rounded-full border border-white/12 bg-[#081120]/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#cbd5e1] backdrop-blur-md transition hover:border-[#fef08a]/35 hover:text-[#fef08a]"
                    >
                      {genre.name}
                    </Link>
                  ))
                ) : (
                  <span className="rounded-full border border-white/12 bg-[#081120]/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#cbd5e1] backdrop-blur-md">
                    Esperienza narrativa
                  </span>
                )}
              </div>
            </article>

            <section className="space-y-6 rounded-[32px] border border-white/10 bg-[#071121]/72 p-6 shadow-[0_30px_90px_rgba(5,10,21,0.4)] backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#7dd3fc]/30 bg-[#38bdf8]/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#7dd3fc]">
                  Game dossier
                </span>
                {game?.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glow"
                  >
                    Sito ufficiale
                    <FaArrowUpRightFromSquare className="text-xs" />
                  </a>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="font-orbitron text-4xl font-black leading-tight text-white sm:text-5xl">
                  {game?.name || "Titolo sconosciuto"}
                </h1>
                <p className="max-w-3xl text-sm leading-8 text-[#cbd5e1] sm:text-base">
                  {game?.description_raw || "Descrizione non disponibile"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {infoCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[24px] border border-white/10 bg-black/15 p-4"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">
                      {card.icon}
                    </div>
                    <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#94a3b8]">
                      {card.label}
                    </span>
                    <strong className="mt-2 block text-lg font-bold text-white">
                      {card.value}
                    </strong>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                <article className="rounded-[28px] border border-white/10 bg-black/15 p-5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#94a3b8]">
                    Piattaforme disponibili
                  </span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {platforms.length > 0 ? (
                      platforms.map((platform) => (
                        <Link
                          key={`${platform.id}-${platform.slug}`}
                          to={`/platform/${platform.id}/${platform.slug}`}
                          className="rounded-full border border-white/10 bg-[#0d1b35] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc] transition hover:border-[#7dd3fc]/40 hover:bg-[#0f203f] hover:text-white"
                        >
                          {platform.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-[#94a3b8]">
                        Nessuna piattaforma disponibile.
                      </span>
                    )}
                  </div>
                </article>

                <article className="rounded-[28px] border border-white/10 bg-black/15 p-5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#94a3b8]">
                    Studio & pubblicazione
                  </span>
                  <dl className="mt-4 space-y-4 text-sm leading-7 text-[#cbd5e1]">
                    <div>
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc]">
                        Developers
                      </dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {developers.length > 0 ? (
                          developers.map((developer) => (
                            <Link
                              key={developer.slug}
                              to={`/developer/${developer.slug}`}
                              className="rounded-full border border-white/10 bg-[#0d1b35] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc] transition hover:border-[#7dd3fc]/40 hover:bg-[#0f203f] hover:text-white"
                            >
                              {developer.name}
                            </Link>
                          ))
                        ) : (
                          <span>Non disponibile</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc]">
                        Publishers
                      </dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {publishers.length > 0 ? (
                          publishers.map((publisher) => (
                            <Link
                              key={publisher.slug}
                              to={`/publisher/${publisher.slug}`}
                              className="rounded-full border border-white/10 bg-[#0d1b35] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc] transition hover:border-[#7dd3fc]/40 hover:bg-[#0f203f] hover:text-white"
                            >
                              {publisher.name}
                            </Link>
                          ))
                        ) : (
                          <span>Non disponibile</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              </div>
            </section>
          </section>
        </div>

        {profile && <BodySection profile_id={profile.id} game={game} />}                



      </main>
    </div>
  );
}
