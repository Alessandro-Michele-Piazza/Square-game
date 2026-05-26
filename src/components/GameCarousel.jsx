import { useEffect, useMemo, useState } from "react";
import "../css/components/GameCarousel.css";
import "../css/base/button.css";

function buildSlides({ trailers, screenshots, fallbackImage, title }) {
  const coverSlide = fallbackImage
    ? {
        id: "cover-image",
        type: "image",
        url: fallbackImage,
        thumb: fallbackImage,
        poster: fallbackImage,
        label: `${title || "Game"} - Cover`,
      }
    : null;

  const trailerSlides = (trailers ?? [])
    .map((trailer, index) => {
      const videoUrl =
        trailer?.data?.max || trailer?.data?.["480"] || trailer?.preview;

      if (!videoUrl) {
        return null;
      }

      return {
        id: trailer?.id ?? `trailer-${index}`,
        type: "video",
        url: videoUrl,
        thumb: trailer?.preview || fallbackImage || "",
        poster: trailer?.preview || fallbackImage || "",
        label: trailer?.name || `Trailer ${index + 1}`,
      };
    })
    .filter(Boolean);

  const screenshotSlides = (screenshots ?? [])
    .map((shot, index) => {
      if (!shot?.image) {
        return null;
      }

      if (fallbackImage && shot.image === fallbackImage) {
        return null;
      }

      return {
        id: shot?.id ?? `shot-${index}`,
        type: "image",
        url: shot.image,
        thumb: shot.image,
        poster: shot.image,
        label: `${title || "Game"} - Screenshot ${index + 1}`,
      };
    })
    .filter(Boolean);

  const combinedSlides = [coverSlide, ...trailerSlides, ...screenshotSlides].filter(
    Boolean,
  );

  return combinedSlides;
}

function CarouselArrowIcon() {
  return (
    <span className="next-btn-icon-arrow" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 34 14"
        fill="none"
      >
        <path className="next-btn-arrow-one" d="M0 0L8 7L0 14H4L12 7L4 0H0Z" />
        <path className="next-btn-arrow-two" d="M11 0L19 7L11 14H15L23 7L15 0H11Z" />
        <path className="next-btn-arrow-three" d="M22 0L30 7L22 14H26L34 7L26 0H22Z" />
      </svg>
    </span>
  );
}

export default function GameCarousel({
  screenshots = [],
  trailers = [],
  fallbackImage = "",
  title = "",
}) {
  const slides = useMemo(
    () => buildSlides({ trailers, screenshots, fallbackImage, title }),
    [fallbackImage, screenshots, title, trailers],
  );
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current > slides.length - 1) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  if (!slides.length) {
    return (
      <div className="carousel-empty">
        <span>Media non disponibile</span>
      </div>
    );
  }

  const activeSlide = slides[current];

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="carousel-root">
      <div className="carousel-main">
        {activeSlide.type === "video" ? (
          <video
            key={activeSlide.url}
            controls
            preload="metadata"
            className="carousel-video"
            poster={activeSlide.poster}
          >
            <source src={activeSlide.url} type="video/mp4" />
            Il tuo browser non supporta il video.
          </video>
        ) : (
          <img
            src={activeSlide.url}
            alt={activeSlide.label}
            className="carousel-img"
          />
        )}

        <div className="carousel-fade" />

        <div className="carousel-topbar">
          <span>
            {current + 1}/{slides.length}
          </span>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="carousel-nav">
          <div className="next-btn-container">
            <button
              type="button"
              className="next-btn-content is-prev"
              onClick={goPrev}
              aria-label="Slide precedente"
            >
              <CarouselArrowIcon />
            </button>
          </div>

          <div className="carousel-thumbs" role="tablist" aria-label="Media del gioco">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === current}
                className={`carousel-thumb ${index === current ? "is-active" : ""}`}
                onClick={() => setCurrent(index)}
              >
                <img src={slide.thumb || slide.poster} alt={slide.label} />
              </button>
            ))}
          </div>

          <div className="next-btn-container">
            <button
              type="button"
              className="next-btn-content"
              onClick={goNext}
              aria-label="Slide successiva"
            >
              <CarouselArrowIcon />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}