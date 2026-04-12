import { FaGlobe, FaInstagram, FaTwitch } from "react-icons/fa6";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <img
            src="/favicon.svg"
            alt="Square Games logo"
            className="site-footer__logo"
          />
          <div>
            <p className="site-footer__title">Square Games</p>
            <p className="site-footer__tagline">Gaming picks, clean and sharp.</p>
          </div>
        </div>

        <div className="site-footer__socials" aria-label="External gaming links">
          <a
            href="https://www.everyeye.it/"
            target="_blank"
            rel="noreferrer"
            aria-label="Everyeye"
          >
            <FaGlobe />
          </a>
          <a
            href="https://www.instagram.com/playstationit/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram gaming"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.twitch.tv/directory/category/games"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitch gaming"
          >
            <FaTwitch />
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>Powered by Alessandro Michele Piazza</p>
      </div>
    </footer>
  );
}
