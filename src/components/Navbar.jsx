import { Link, useNavigate } from "react-router";
import routes from "../router/routes";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/user-context";
import { FaArrowRightFromBracket, FaBars, FaXmark } from "react-icons/fa6";
import supabase from "../database/supabase";
import Placeholder from "../assets/Portrait_Placeholder.png";

export default function Navbar({ onOpenGenres, sticky = true }) {
  const [slug, setSlug] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const avatarUrl =
    profile?.avatar_url && profile.avatar_url.startsWith("http")
      ? profile.avatar_url
      : signedAvatar.path === profile?.avatar_url && signedAvatar.url
        ? signedAvatar.url
        : Placeholder;

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && slug.trim()) {
      navigate(`/search/${slug.trim()}`);
      setSlug("");
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`${sticky ? "sticky top-0" : "relative"} z-50 px-3 pt-3 sm:px-5 sm:pt-4`}
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <nav className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* Logo chip */}
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
            <Link
              className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.01]"
              to={routes.home}
            >
              <img
                src="/favicon.svg"
                alt="Square Games logo"
                className="h-10 w-10 rounded-2xl object-contain drop-shadow-[0_0_14px_rgba(254,240,138,0.24)] sm:h-11 sm:w-11"
              />
              <span className="hidden xs:block">
                <span className="block font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-[#fef08a] drop-shadow-[0_0_8px_rgba(254,240,138,0.35)] sm:text-base">
                  Square Games
                </span>
                <span className="block text-[0.56rem] uppercase tracking-[0.32em] text-[#7dd3fc] sm:text-[0.62rem]">
                  discover. rank. play.
                </span>
              </span>
            </Link>

            {typeof onOpenGenres === "function" && (
              <button
                type="button"
                onClick={onOpenGenres}
                aria-label="Apri menu generi"
                className="topbar-genre-trigger"
              >
                <FaBars className="text-sm" />
                <span className="hidden sm:inline">Generi</span>
              </button>
            )}
          </div>

          {/* Search chip (desktop) */}
          <div className="hidden md:flex justify-center">
            <div className=" w-full max-w-xl px-4 py-2.5 lg:px-5">
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
          <div className=" flex items-center justify-end gap-2 px-2 py-2 sm:px-3">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              {!user ? (
                <>
                  <Link className="topbar-pill-link" to={routes.login}>
                    Accedi
                  </Link>
                  <Link
                    className="topbar-pill-link topbar-pill-link--accent"
                    to={routes.register}
                  >
                    Registrati
                  </Link>
                </>
              ) : (
                <>
                  <Link to={routes.profile} className="topbar-profile-chip">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-[#fef08a]/30"
                    />
                    <span>{profile?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="topbar-pill-link topbar-pill-link--danger"
                  >
                    <FaArrowRightFromBracket className="text-xs" /> Logout
                  </button>
                </>
              )}
            </div>

            <button
              className="topbar-icon-button inline-flex md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              {isMenuOpen ? <FaXmark /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* Mobile floating panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[420px] pt-3" : "max-h-0"
          }`}
        >
          <div className="topbar-mobile-panel ml-auto w-full max-w-sm p-4">
            <div className="relative mb-3">
              <input
                type="text"
                className="topbar-search-input"
                placeholder="Search games..."
                value={slug}
                onChange={handleChange}
                onKeyDown={handleSearch}
              />
            </div>

            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  className="topbar-pill-link topbar-pill-link--accent w-full justify-center"
                  to={routes.register}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrati
                </Link>
                <Link
                  className="topbar-pill-link w-full justify-center"
                  to={routes.login}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accedi
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to={routes.profile}
                  className="topbar-profile-chip w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-[#fef08a]/30"
                  />
                  <span>{profile?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="topbar-pill-link topbar-pill-link--danger w-full justify-center"
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
