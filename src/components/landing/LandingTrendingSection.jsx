import { Link } from "react-router";
import "../../css/components/LandingTrendingSection.css";

export default function LandingTrendingSection({ cards }) {
  return (
    <section
      className="landing-trending"
      aria-label="Trending this month"
      data-aos="fade-up"
      data-aos-duration="680"
    >
      <div className="landing-trending__header" data-aos="fade-right" data-aos-delay="70">
        <Link to="/home" >
          <h2 className="landing-trending__eyebrow">Trending this month</h2>
        </Link>
      </div>

      <div className="landing-trending__grid" data-aos="fade-up" data-aos-delay="110">
        {cards.map((card, index) => (
          <Link
            key={card.key}
            to={card.to}
            className="landing-trending-card"
            data-aos={index % 2 === 0 ? "fade-up-right" : "fade-up-left"}
            data-aos-delay={120 + index * 55}
          >
            <img
              src={card.image}
              alt={card.title}
              className="landing-trending-card__image"
              loading="lazy"
            />
            <div className="landing-trending-card__overlay" />
            <div className="landing-trending-card__content">
                <h3 className="landing-trending-card__title">{card.title}</h3>
              <p className="landing-trending-card__meta">
                {card.genre}
                <span aria-hidden="true"> • </span>
                {card.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
