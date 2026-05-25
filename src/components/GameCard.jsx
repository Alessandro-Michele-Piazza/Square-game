import { Link } from "react-router";

const fallbackImage =
  "https://placehold.co/600x900/081120/e2e8f0?text=No+Image";

export default function Gamecard({ game }) {
  const rating =
    typeof game?.rating === "number" ? game.rating.toFixed(1) : "–";
  const cardDelay = (Number(game?.id ?? 0) % 8) * 35;

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-[#22406f]/65 bg-[#0b1a31] p-[1px] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#fef08a]/45 hover:shadow-[0_20px_46px_rgba(6,18,36,0.6)]"
      data-aos="fade-up"
      data-aos-delay={cardDelay}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[calc(1.45rem-1px)] bg-[#081120]">
        <Link to={`/detail/${game?.id}`} className="absolute inset-0">
          <img
            src={game?.background_image || fallbackImage}
            alt={game?.name || "Game cover"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040a14] via-[#081120]/35 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_0%,rgba(125,211,252,0.18),transparent_52%)] mix-blend-screen" />

          <div className="pointer-events-none absolute right-3 top-3 flex shrink-0 translate-y-1 gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <span className="rounded-full border border-[#fef08a]/30 bg-black/45 px-2.5 py-1 text-[0.65rem] font-bold text-[#fef08a] backdrop-blur-sm">
                ★ {game?.metacritic ?? "–"}
            </span>
            <span className="rounded-full border border-[#7dd3fc]/30 bg-black/45 px-2.5 py-1 text-[0.65rem] font-bold text-[#7dd3fc] backdrop-blur-sm">
                ♥ {rating}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <Link
              to={`/detail/${game?.id}`}
              className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-colors duration-200 hover:text-[#fef08a]"
            >
              {game?.name || "Titolo sconosciuto"}
            </Link>
          </div>
        </Link>
      </div>
    </article>
  );
}
