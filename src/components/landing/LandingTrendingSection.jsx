import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import CarouselArrowIcon from "../CarouselArrowIcon";
import "../../css/base/button.css";
import "../../css/components/LandingTrendingSection.css";

export default function LandingTrendingSection({ cards }) {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(cards.length - 1, 0);
  const safeActiveIndex = Math.min(activeIndex, maxIndex);

  const getSnapStep = useCallback(() => {
    const container = carouselRef.current;
    if (!container) {
      return 0;
    }

    const firstCard = container.querySelector(".landing-trending-card");
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

      <div className="landing-trending__carousel-shell" data-aos="fade-up" data-aos-delay="110">
        <div className="landing-trending__grid" ref={carouselRef}>
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

        <div
          className="landing-trending__controls"
          aria-label="Controlli carosello trending"
          data-aos="fade-up"
          data-aos-delay="130"
        >
          <div className="next-btn-container">
            <button
              type="button"
              className="next-btn-content is-prev"
              onClick={() => moveBy(-1)}
              aria-label="Trending precedente"
              disabled={safeActiveIndex === 0}
            >
              <CarouselArrowIcon />
            </button>
          </div>

          <div className="landing-trending__dots">
            {cards.map((card, index) => (
              <button
                key={`${card.key}-dot`}
                type="button"
                className={`landing-trending__dot${index === safeActiveIndex ? " is-active" : ""}`}
                aria-label={`Vai a ${card.title}`}
                aria-pressed={index === safeActiveIndex}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>

          <div className="next-btn-container">
            <button
              type="button"
              className="next-btn-content"
              onClick={() => moveBy(1)}
              aria-label="Trending successivo"
              disabled={safeActiveIndex === maxIndex}
            >
              <CarouselArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
