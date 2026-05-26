import { FaLinkedinIn } from "react-icons/fa6";
import "../css/components/Footer.css";
import { Link } from "react-router";

function PortfolioSparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="site-footer__portfolio-icon"
      aria-hidden="true"
    >
      <path
        d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 17.5h8M10 19.5h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="m12 8.5 1.2 2.1 2.4.4-1.7 1.7.4 2.4-2.3-1.1-2.3 1.1.4-2.4-1.7-1.7 2.4-.4L12 8.5Z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__surface">
        <div className="site-footer__top">
          <Link to="/" className="site-footer__brand-link">
            <div className="site-footer__brand">
              <img
                src="/media/favicon.svg"
                alt="Square Games logo"
                className="site-footer__logo"
              />
              <div>
                <p className="site-footer__title">Square Games</p>
                <p className="site-footer__tagline">
                  Gaming picks, clean and sharp.
                </p>
              </div>
            </div>
          </Link>

          <div className="site-footer__actions">
            <p className="site-footer__actions-label">Connettiti</p>
            <div
              className="site-footer__socials"
              aria-label="External profile links"
            >
              <a
                href="https://www.linkedin.com/in/alessandro-michele-piazza-13b751171/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Alessandro Michele Piazza LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://alessandro-michele-piazza.github.io"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Portfolio di Alessandro Michele Piazza"
              >
                <PortfolioSparkIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__legal">
            Copyright {currentYear} Square Games. All rights reserved.
          </p>
          <p className="site-footer__credit">
            Powered by
            <a
              href="https://alessandro-michele-piazza.github.io"
              target="_blank"
              rel="noreferrer noopener"
              className="site-footer__credit-link"
            >
              Alessandro Michele Piazza
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
