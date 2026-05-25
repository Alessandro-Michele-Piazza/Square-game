import { useLoaderData, useLocation, useParams } from "react-router";
import Gamelist from "../components/Gamelist";

function formatFilterHeading(pathname, slug) {
  const routeKey = pathname.split("/").filter(Boolean)[0] ?? "search";
  const labels = {
    search: "Search Results",
    genre: "Genere",
    developer: "Developer",
    publisher: "Publisher",
    platform: "Piattaforma",
  };
  const prettySlug = decodeURIComponent(slug ?? "").replace(/-/g, " ");

  if (routeKey === "search") {
    return `${labels.search} by "${prettySlug}"`;
  }

  return `${labels[routeKey] ?? "Filtro"}: "${prettySlug}"`;
}

export default function Searchpage() {
  const data = useLoaderData();
  const games = Array.isArray(data) ? data : [];
  const { slug } = useParams();
  const { pathname } = useLocation();

  return (
    <>
      <h1
        className="font-orbitron text-3xl font-bold text-center my-8 text-[#fef08a] drop-shadow-[0_0_18px_rgba(254,240,138,0.45)]"
        data-aos="fade-up"
      >
        {formatFilterHeading(pathname, slug)}
      </h1>
      {games.length === 0 && (
        <p className="text-center text-[#94a3b8]">
          Nessun gioco trovato per la tua ricerca.
        </p>
      )}
      <Gamelist className="mb-14">
        {games.map((game) => {
          return <Gamelist.Card key={game.id} game={game} />;
        })}
      </Gamelist>
    </>
  );
}
