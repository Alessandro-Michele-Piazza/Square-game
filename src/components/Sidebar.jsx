import { Link } from "react-router";

export default function Sidebar({ genres }) {
  return (
    <aside className="sticky top-[4.2rem] h-[calc(100vh-4.2rem)] w-64 shrink-0 overflow-y-auto border-r border-white/8 bg-[linear-gradient(180deg,rgba(5,10,21,0.98)_0%,rgba(7,17,33,0.98)_100%)] px-5 py-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]">
      <h2 className="mb-6 font-orbitron text-lg font-black uppercase tracking-[0.2em] text-white">
        Generi
      </h2>

      <ul className="space-y-4 pb-6">
        {genres.map((genre) => (
          <li key={genre.id} className="overflow-hidden">
            <Link
              to={`/genre/${genre.slug}`}
              className="detail-link "
              data-text={genre.name}
            >
              {genre.name}
              <span className="detail-link__hover" aria-hidden="true">
                {genre.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
