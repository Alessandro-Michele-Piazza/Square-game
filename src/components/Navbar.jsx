import { Link, useNavigate } from "react-router";
import routes from "../router/routes";
import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../context/user-context";
import {
  FaArrowRightFromBracket,
  FaBars,
  FaChevronDown,
  FaXmark,
} from "react-icons/fa6";
import supabase from "../database/supabase";
import Placeholder from "../media/Portrait_Placeholder.png";
import "../css/components/Navbar.css";

export default function Navbar({
  onOpenGenres,
  sticky = true,
  hideOnMobile = false,
}) {
  const [slug, setSlug] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const handleChange = (e) => setSlug(e.target.value);
  const navigate = useNavigate();
  const { user, profile, signOut } = useContext(UserContext);

  const [signedAvatar, setSignedAvatar] = useState({ path: null, url: null });

  useEffect(() => {
    if (!profile?.avatar_url || profile.avatar_url.startsWith("http")) {
      return;
    }

    const currentPath = profile.avatar_url;

    supabase.storage
      .from("avatars")
      .createSignedUrl(currentPath, 3600)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          setSignedAvatar({ path: currentPath, url: null });
        } else {
          setSignedAvatar({ path: currentPath, url: data.signedUrl });
        }
      });
  }, [profile?.avatar_url]);

  useEffect(() => {
    if (!isUserDropdownOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        userDropdownRef.current
        && !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscapeDown = (event) => {
      if (event.key === "Escape") {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscapeDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscapeDown);
    };
  }, [isUserDropdownOpen]);

  const avatarUrl =
    profile?.avatar_url && profile.avatar_url.startsWith("http")
      ? profile.avatar_url
      : signedAvatar.path === profile?.avatar_url && signedAvatar.url
        ? signedAvatar.url
        : Placeholder;

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    closeAllMenus();
    navigate(routes.landing);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && slug.trim()) {
      navigate(`/search/${slug.trim()}`);
      setSlug("");
      closeAllMenus();
    }
  };

  const handleOpenGenresFromMenu = () => {
    if (typeof onOpenGenres !== "function") {
      return;
    }

    setIsMobileMenuOpen(false);
    onOpenGenres();
  };

  const topbarClassName = [
    "topbar",
    sticky ? "topbar--sticky" : "topbar--static",
    hideOnMobile ? "topbar--mobile-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={topbarClassName}>
      <div className="topbar-shell">
        <nav className="topbar-grid">
          {/* Logo chip */}
          <div className="topbar-brand-zone">
            {typeof onOpenGenres === "function" && (
              <button
                type="button"
                onClick={onOpenGenres}
                aria-label="Apri menu filtri"
                className="btn-secondary topbar-genre-trigger topbar-genre-trigger--desktop"
              >
                <FaBars />
              </button>
            )}

            <Link className="topbar-brand-link" to={routes.landing}>
              <img
                src="/media/favicon.svg"
                alt="Square Games logo"
                className="topbar-logo"
              />
              <span className="topbar-brand-copy">
                <span className="topbar-brand-title">Square Games</span>
                <span className="topbar-brand-tagline">
                  discover. rank. play.
                </span>
              </span>
            </Link>
          </div>

          {/* Search chip (desktop) */}
          <div className="topbar-search-desktop">
            <div className="topbar-search-shell">
              <input
                type="text"
                className="topbar-search-input"
                placeholder="Search games..."
                value={slug}
                onChange={handleChange}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Action chip */}
          <div className="topbar-actions-zone">
            <div className="topbar-actions-desktop">
              {!user ? (
                <>
                  <Link className="btn-secondary topbar-pill-link" to={routes.login}>
                    Accedi
                  </Link>
                  <Link
                    className="btn-primary topbar-pill-link topbar-pill-link--accent"
                    to={routes.register}
                  >
                    Registrati
                  </Link>
                </>
              ) : (
                <div
                  ref={userDropdownRef}
                  className={`topbar-user-menu ${
                    isUserDropdownOpen ? "is-open" : ""
                  }`.trim()}
                >
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((previousState) => !previousState)}
                    className="btn-secondary topbar-user-toggle"
                    aria-label="Apri menu utente"
                    aria-haspopup="menu"
                    aria-expanded={isUserDropdownOpen}
                  >
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="topbar-avatar"
                    />
                    <span>{profile?.username || "Profilo"}</span>
                    <FaChevronDown className="topbar-user-chevron" />
                  </button>

                  <div className="topbar-user-dropdown" role="menu">
                    <Link
                      to={routes.profile}
                      role="menuitem"
                      className="topbar-user-dropdown-link"
                      onClick={closeAllMenus}
                    >
                      Profilo
                    </Link>
                    <Link
                      to={routes.profile_settings}
                      role="menuitem"
                      className="topbar-user-dropdown-link"
                      onClick={closeAllMenus}
                    >
                      Modifica profilo
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="topbar-user-dropdown-link topbar-user-dropdown-link--danger"
                    >
                      <FaArrowRightFromBracket /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn-secondary topbar-icon-button topbar-menu-toggle"
              onClick={() => setIsMobileMenuOpen((previousState) => !previousState)}
              aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              {isMobileMenuOpen ? <FaXmark /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* Mobile floating panel */}
        <div
          className={`topbar-mobile-wrap ${isMobileMenuOpen ? "is-open" : ""}`.trim()}
        >
          <div className="topbar-mobile-panel topbar-mobile-panel--content">
            <div className="topbar-mobile-search">
              <input
                type="text"
                className="topbar-search-input"
                placeholder="Search games..."
                value={slug}
                onChange={handleChange}
                onKeyDown={handleSearch}
              />
            </div>

            {typeof onOpenGenres === "function" && (
              <div className="topbar-mobile-group">
                <button
                  type="button"
                  onClick={handleOpenGenresFromMenu}
                  className="btn-secondary topbar-pill-link topbar-pill-link--block topbar-pill-link--filters"
                >
                  Filtri
                </button>
              </div>
            )}

            {!user ? (
              <div className="topbar-mobile-group">
                <Link
                  className="btn-primary topbar-pill-link topbar-pill-link--accent topbar-pill-link--block"
                  to={routes.register}
                  onClick={closeAllMenus}
                >
                  Registrati
                </Link>
                <Link
                  className="btn-secondary topbar-pill-link topbar-pill-link--block"
                  to={routes.login}
                  onClick={closeAllMenus}
                >
                  Accedi
                </Link>
              </div>
            ) : (
              <div className="topbar-mobile-group">
                <Link
                  to={routes.profile}
                  className="topbar-profile-chip topbar-profile-chip--block"
                  onClick={closeAllMenus}
                >
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="topbar-avatar topbar-avatar--mobile"
                  />
                  <span>{profile?.username}</span>
                </Link>

                <Link
                  to={routes.profile_settings}
                  className="btn-secondary topbar-pill-link topbar-pill-link--block"
                  onClick={closeAllMenus}
                >
                  Modifica profilo
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn-secondary topbar-pill-link topbar-pill-link--danger topbar-pill-link--block"
                >
                  <FaArrowRightFromBracket /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
