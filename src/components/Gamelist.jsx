import GameCard from "./GameCard";

export default function Gamelist({ children }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

Gamelist.Card = GameCard;