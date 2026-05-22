import { Link } from "react-router";
import { FaXmark } from "react-icons/fa6";

export default function Sidebar({ genres, isOpen, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Chiudi menu generi"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 h-[100%] w-[min(20rem,86vw)] overflow-y-auto border-r border-[#7dd3fc]/18 bg-[linear-gradient(180deg,rgba(5,10,21,0.6)_0%,rgba(8,18,36,0.4)_100%)] backdrop-blur-md px-5 py-6 shadow-[12px_0_44px_rgba(2,6,23,0.65)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-orbitron text-lg font-black uppercase tracking-[0.2em] text-white">
            Generi
          </h2>
          <button
            onClick={onClose}
            aria-label="Chiudi menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-[#0d1b35] text-[#94a3b8] transition hover:border-[#fef08a]/30 hover:text-[#fef08a]"
          >
            <FaXmark />
          </button>
        </div>

        <ul className="space-y-4 pb-6">
          {genres.map((genre) => (
            <li key={genre.id} className="overflow-hidden">
              <Link
                to={`/genre/${genre.slug}`}
                className="detail-link"
                data-text={genre.name}
                onClick={onClose}
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
    </div>
  );
}
