import { Link } from "react-router";

const fallbackImage =
  "https://placehold.co/600x900/081120/e2e8f0?text=No+Image";

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Gamecard({ game }) {
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "–";
  const cardDelay = (Number(game?.id ?? 0) % 8) * 35;
  const platforms = (game?.parent_platforms ?? game?.platforms ?? [])
    .map((entry) => {
      const platform = entry?.platform ?? entry;
      const name = platform?.name;
      const id = platform?.id;
      const slug = platform?.slug ?? slugify(name);

      if (!name || !id || !slug) {
        return null;
      }

      return { id, name, slug };
    })
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article
      className="group relative rounded-2xl bg-[#1a2f52] p-[1px] transition duration-300 hover:-translate-y-1 hover:bg-[#fef08a]/35 hover:shadow-[0_16px_48px_rgba(254,240,138,0.08)]"
      data-aos="fade-up"
      data-aos-delay={cardDelay}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[15px] bg-[#081120]">
        <Link to={`/detail/${game?.id}`} className="absolute inset-0">
          <img
            src={game?.background_image || fallbackImage}
            alt={game?.name || "Game cover"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-transparent" />

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start gap-2">
            {/* Piattaforme — alto a sinistra */}
            {platforms.length > 0 && (
              <div className="pointer-events-auto flex min-w-0 flex-1 flex-wrap gap-1.5">
                {platforms.map((platform) => (
                  <Link
                    key={`${platform.id}-${platform.slug}`}
                    to={`/platform/${platform.id}/${platform.slug}`}
                    className="inline-flex max-w-full items-center truncate rounded-full border border-white/10 bg-[#0d1b35] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dd3fc] transition hover:border-[#7dd3fc]/40 hover:bg-[#0f203f] hover:text-white"
                  >
                    {platform.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Badge rating + metacritic — alto a destra */}
            <div className="ml-auto flex shrink-0 gap-1.5">
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[0.65rem] font-bold text-[#fef08a] backdrop-blur-sm">
                ★ {game?.metacritic ?? "–"}
              </span>
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[0.65rem] font-bold text-[#7dd3fc] backdrop-blur-sm">
                ♥ {rating}
              </span>
            </div>
          </div>

          {/* Titolo — sovrapposto in basso sull'immagine */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <Link
              to={`/detail/${game?.id}`}
              className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-colors duration-200 cursor-pointer hover:text-[#fef08a]"
            >
              {game?.name || "Titolo sconosciuto"}
            </Link>
          </div>
        </Link>
      </div>
    </article>
  );
}
