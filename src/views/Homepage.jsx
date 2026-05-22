import { useLoaderData } from "react-router";
import Gamelist from "../components/Gamelist";

export default function Homepage() {
  const data = useLoaderData();
  const games = Array.isArray(data) ? data : [];

  return (
    <>
      <h1
        className="font-orbitron text-3xl font-bold text-center my-8 text-[#fef08a] drop-shadow-[0_0_18px_rgba(254,240,138,0.45)]"
        data-aos="fade-up"
      >
        Top Rated Games
      </h1>
      {games.length === 0 && (
        <p className="text-center text-[#94a3b8]">Nessun gioco trovato. Controlla la API key RAWG.</p>
      )}
      <Gamelist>
        {games.map((game) => {
          return <Gamelist.Card key={game.id} game={game} />;
        })}
      </Gamelist>
    </>
  );
}
