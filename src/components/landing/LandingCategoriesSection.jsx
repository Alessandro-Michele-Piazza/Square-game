import { Link } from "react-router";
import "../../css/components/LandingCategoriesSection.css";

export default function LandingCategoriesSection({ cards, allCollectionsTo }) {
  return (
    <section className="landing-categories" aria-label="Collezioni in evidenza">
      <div className="landing-categories__intro" data-aos="fade-right">
        <p className="landing-categories__eyebrow">Collezioni in evidenza</p>
        <h2 className="landing-categories__title">Esplora. Scopri. Gioca.</h2>
        <p className="landing-categories__description">
          Collezioni curate per stile e mood: passa da un filtro all'altro e
          trova il prossimo titolo perfetto per te.
        </p>
        <Link to={allCollectionsTo} className="landing-categories__all-link">
          Vedi tutte le collezioni
        </Link>
      </div>

      <div className="landing-categories__cards" data-aos="fade-left" data-aos-delay="90">
        {cards.map((card, index) => (
          <Link
            key={card.key}
            to={card.to}
            className="landing-category-card"
            data-aos="fade-left"
            data-aos-delay={110 + index * 45}
          >
            <img
              src={card.image}
              alt={card.title}
              className="landing-category-card__image"
              loading="lazy"
            />
            <div className="landing-category-card__overlay" />
            <div className="landing-category-card__content">
              <h3 className="landing-category-card__title">{card.title}</h3>
              <p className="landing-category-card__subtitle">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
