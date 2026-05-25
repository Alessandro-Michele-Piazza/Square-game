import GameCard from "./GameCard";

export default function Gamelist({ children, className = "" }) {
  const baseClassName = "mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div
      className={`${baseClassName} ${className}`.trim()}
      data-aos="fade-up"
      data-aos-delay="80"
    >
      {children}
    </div>
  );
}

Gamelist.Card = GameCard;