import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import "../../css/components/LandingCategoriesSection.css";

export default function LandingCategoriesSection({ cards, allCollectionsTo }) {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(cards.length - 1, 0);
  const safeActiveIndex = Math.min(activeIndex, maxIndex);

  const getSnapStep = useCallback(() => {
    const container = carouselRef.current;
    if (!container) {
      return 0;
    }

    const firstCard = container.querySelector(".landing-category-card");
    if (!firstCard) {
      return 0;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(container);
    const gapValue = styles.columnGap === "normal" ? styles.gap : styles.columnGap;
    const gap = Number.parseFloat(gapValue) || Number.parseFloat(styles.gap) || 0;

    return cardWidth + gap;
  }, []);

  const syncIndexFromScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) {
      return;
    }

    const step = getSnapStep();
    if (!step) {
      setActiveIndex(0);
      return;
    }

    const nextIndex = Math.round(container.scrollLeft / step);
    const safeIndex = Math.max(0, Math.min(cards.length - 1, nextIndex));
    setActiveIndex(safeIndex);
  }, [cards.length, getSnapStep]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) {
      return undefined;
    }

    const handleScroll = () => {
      syncIndexFromScroll();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", syncIndexFromScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", syncIndexFromScroll);
    };
  }, [syncIndexFromScroll]);

  const scrollToIndex = useCallback(
    (index) => {
      const container = carouselRef.current;
      if (!container) {
        return;
      }

      const step = getSnapStep();
      if (!step) {
        return;
      }

      const safeIndex = Math.max(0, Math.min(cards.length - 1, index));
      container.scrollTo({
        left: safeIndex * step,
        behavior: "smooth",
      });
      setActiveIndex(safeIndex);
    },
    [cards.length, getSnapStep]
  );

  const moveBy = useCallback(
    (delta) => {
      scrollToIndex(safeActiveIndex + delta);
    },
    [safeActiveIndex, scrollToIndex]
  );

  return (
    <section
      className="landing-categories"
      aria-label="Collezioni in evidenza"
      data-aos="fade-up"
      data-aos-duration="700"
    >
      <div className="landing-categories__intro" data-aos="fade-right">
        <p className="landing-categories__eyebrow" data-aos="fade-up" data-aos-delay="80">
          Collezioni in evidenza
        </p>
        <h2 className="landing-categories__title" data-aos="fade-up" data-aos-delay="130">
          Esplora. Scopri. Gioca.
        </h2>
        <p className="landing-categories__description" data-aos="fade-up" data-aos-delay="180">
          Collezioni curate per stile e mood: passa da un filtro all'altro e
          trova il prossimo titolo perfetto per te.
        </p>
        <Link
          to={allCollectionsTo}
          className="landing-categories__all-link"
          data-aos="fade-up"
          data-aos-delay="230"
        >
          Vedi tutte le collezioni
        </Link>
      </div>

      <div className="landing-categories__carousel-shell" data-aos="fade-left" data-aos-delay="90">
        <div className="landing-categories__cards" ref={carouselRef}>
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

        <div
          className="landing-categories__controls"
          aria-label="Controlli carosello categorie"
          data-aos="fade-up"
          data-aos-delay="120"
        >
          <button
            type="button"
            className="landing-categories__control-button"
            onClick={() => moveBy(-1)}
            aria-label="Categoria precedente"
            disabled={safeActiveIndex === 0}
          >
            <span aria-hidden="true">&#8249;</span>
          </button>

          <div className="landing-categories__dots">
            {cards.map((card, index) => (
              <button
                key={`${card.key}-dot`}
                type="button"
                className={`landing-categories__dot${index === safeActiveIndex ? " is-active" : ""}`}
                aria-label={`Vai alla categoria ${card.title}`}
                aria-pressed={index === safeActiveIndex}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            className="landing-categories__control-button"
            onClick={() => moveBy(1)}
            aria-label="Categoria successiva"
            disabled={safeActiveIndex === maxIndex}
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
