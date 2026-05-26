import GameCard from "./GameCard";
import "../css/components/Gamelist.css";

export default function Gamelist({ children, className = "", isEmpty = false }) {
  const baseClassName = "gamelist";
  const emptyClassName = isEmpty ? "gamelist--empty" : "";

  return (
    <div
      className={[baseClassName, className, emptyClassName].filter(Boolean).join(" ")}
      data-aos="fade-up"
      data-aos-delay="80"
    >
      {children}
    </div>
  );
}

Gamelist.Card = GameCard;