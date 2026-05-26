import { useMemo, useState } from "react";
import CarouselArrowIcon from "./CarouselArrowIcon";
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

  if (!slides.length) {
    return (
      <div className="carousel-empty">
        <span>Media non disponibile</span>
      </div>
    );
  }

  const safeCurrent = Math.min(current, slides.length - 1);
  const activeSlide = slides[safeCurrent];

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
            {safeCurrent + 1}/{slides.length}
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
                aria-selected={index === safeCurrent}
                className={`carousel-thumb ${index === safeCurrent ? "is-active" : ""}`}
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