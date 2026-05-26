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
    >
      <div className="landing-hero__content" data-aos="fade-up" data-aos-delay="80">
        <p className="landing-hero__eyebrow">Gioco in evidenza</p>
        <h1 className="landing-hero__title">{title}</h1>
        <p className="landing-hero__description">{description}</p>

        <div className="landing-hero__actions">
          <Link
            to={primaryAction.to}
            className="landing-hero__button profile-button profile-button--primary"
          >
            {primaryAction.label}
          </Link>

          <Link
            to={secondaryAction.to}
            className="landing-hero__button profile-button profile-button--secondary"
          >
            {secondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
