import { Link } from "react-router";
import routes from "../../router/routes";
import "../../css/components/LandingHeroSection.css";

export default function LandingHeroSection({
  title,
  description,
  description2,
  img_logo = "/media/ff7_logo.webp",
  link_square,
  primaryAction,
  secondaryAction,
}) {
  return (
    <section
      className="landing-hero"
      aria-label="Hero landing"
      data-aos="zoom-out"
      data-aos-duration="760"
    >
      <div className="landing-hero__content" data-aos="fade-up" data-aos-delay="80">
        <p className="landing-hero__eyebrow" data-aos="fade-up" data-aos-delay="130">
          Gioco in evidenza
        </p>
        {/* <h1 className="landing-hero__title" data-aos="fade-up" data-aos-delay="190">
          {title}
        </h1> */}
          <img src={img_logo} alt={`${title} logo`} className="landing-hero__logo" data-aos="fade-up" data-aos-delay="190" width="300" height="120" fetchpriority="high" />
        <p className="landing-hero__description" data-aos="fade-up" data-aos-delay="260">
          {description}
        </p>
        <p className="landing-hero__description" data-aos="fade-up" data-aos-delay="260">
          {description2}{" "}
          <Link to={routes.developer.replace(":slug", "square-enix")} className="square_enix_link">{link_square}</Link>
        </p>

        <div className="landing-hero__actions" data-aos="fade-up" data-aos-delay="320">
          <Link
            to={primaryAction.to}
            className="landing-hero__button"
            // data-aos="zoom-in"
            // data-aos-delay="360"
          >
            {primaryAction.label}
          </Link>

          <Link
            to={secondaryAction.to}
            className="landing-hero__button_2"
            // data-aos="zoom-in"
            // data-aos-delay="420"
          >
            {secondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
