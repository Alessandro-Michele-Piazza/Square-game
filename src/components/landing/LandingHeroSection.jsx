import { Link } from "react-router";
import "../../css/components/LandingHeroSection.css";

export default function LandingHeroSection({
  title,
  description,
  backgroundImage,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section
      className="landing-hero"
      style={{ "--landing-hero-image": `url(${backgroundImage})` }}
      aria-label="Hero landing"
      data-aos="zoom-out"
      data-aos-duration="760"
    >
      <div className="landing-hero__content" data-aos="fade-up" data-aos-delay="80">
        <p className="landing-hero__eyebrow" data-aos="fade-up" data-aos-delay="130">
          Gioco in evidenza
        </p>
        <h1 className="landing-hero__title" data-aos="fade-up" data-aos-delay="190">
          {title}
        </h1>
        <p className="landing-hero__description" data-aos="fade-up" data-aos-delay="260">
          {description}
        </p>

        <div className="landing-hero__actions" data-aos="fade-up" data-aos-delay="320">
          <Link
            to={primaryAction.to}
            className="landing-hero__button profile-button profile-button--primary"
            data-aos="zoom-in"
            data-aos-delay="360"
          >
            {primaryAction.label}
          </Link>

          <Link
            to={secondaryAction.to}
            className="landing-hero__button profile-button profile-button--secondary"
            data-aos="zoom-in"
            data-aos-delay="420"
          >
            {secondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
