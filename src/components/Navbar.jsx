import { Link, useNavigate } from "react-router";
import routes from "../router/routes";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/user-context";
import { FaArrowRightFromBracket, FaBars, FaXmark } from "react-icons/fa6";
import supabase from "../database/supabase";
import Placeholder from "../assets/Portrait_Placeholder.png";

export default function Navbar() {
  const [slug, setSlug] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (e) => setSlug(e.target.value);
  const navigate = useNavigate();
  const { user, profile, signOut } = useContext(UserContext);

  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url ? null : Placeholder,
  );

  useEffect(() => {
    if (!profile?.avatar_url) {
      setAvatarUrl(Placeholder);
      return;
    }
    if (profile.avatar_url.startsWith("http")) {
      setAvatarUrl(profile.avatar_url);
      return;
    }
    supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_url, 3600)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          setAvatarUrl(Placeholder);
        } else {
          setAvatarUrl(data.signedUrl);
        }
      });
  }, [profile?.avatar_url]);

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
    <header className="sticky top-0 z-50 border-b border-[#fef08a]/10 bg-[#050a15]/90 text-white backdrop-blur-md shadow-lg shadow-black/20">
      <nav className="mx-auto flex max-w-full items-center px-6 py-3">
        {/* --- SINISTRA: LOGO --- */}
        <div className="flex flex-1 justify-start">
          <Link
            className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.01]"
            to={routes.home}
          >
            <img
              src="/favicon.svg"
              alt="Square Games logo"
              className="h-11 w-11 rounded-2xl object-contain drop-shadow-[0_0_14px_rgba(254,240,138,0.24)]"
            />
            <span className="hidden xs:block">
              <span className="block font-orbitron text-lg font-bold uppercase tracking-[0.24em] text-[#fef08a] drop-shadow-[0_0_8px_rgba(254,240,138,0.35)]">
                Square Games
              </span>
              <span className="block text-[0.62rem] uppercase tracking-[0.34em] text-[#60a5fa]">
                discover. rank. play.
              </span>
            </span>
          </Link>
        </div>

        {/* --- CENTRO: SEARCH BAR (Hidden on Mobile) --- */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative">
            <input
              type="text"
              className="w-64 rounded-full border border-[#3b82f6]/30 bg-[#0d1b35]/80 px-5 py-2 text-sm text-white placeholder-[#64748b] transition-all focus:w-80 focus:border-[#fef08a]/60 focus:ring-2 focus:ring-[#fef08a]/20 focus:outline-none"
              placeholder="Search games..."
              value={slug}
              onChange={handleChange}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* --- DESTRA: NAV LINKS / PROFILE / HAMBURGER --- */}
        <div className="flex flex-1 justify-end items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link className="navbar-home-link" to={routes.home}>
              Home
            </Link>
            {!user ? (
              <>
                <Link className="navbar-home-link" to={routes.login}>
                  Accedi
                </Link>
                <Link
                  className="btn-glow btn-glow--yellow"
                  to={routes.register}
                >
                  Registrati
                </Link>
              </>
            ) : (
              <>
                <Link to={routes.profile} className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1.5 Profile-navbar-custom-link">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-[#fef08a]/30"
                    />
                    {profile?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-glow btn-glow--danger btn-glow--no-reflect ml-2"
                >
                  <FaArrowRightFromBracket className="text-xs" /> Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger Button (Solo Mobile) */}
          <button
            className="md:hidden text-[#fef08a] text-2xl p-2 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* --- MENU MOBILE OVERLAY --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-[450px] border-t border-[#fef08a]/10" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 p-6 bg-[#050a15]">
          {/* Ricerca Mobile */}
          <div className="relative">
            <input
              type="text"
              className="w-full rounded-xl border border-[#3b82f6]/30 bg-[#0d1b35]/80 px-4 py-3 text-sm text-white placeholder-[#64748b] focus:border-[#fef08a]/60 focus:outline-none"
              placeholder="Search games..."
              value={slug}
              onChange={handleChange}
              onKeyDown={handleSearch}
            />
          </div>

          {!user ? (
            <div className="flex flex-col gap-3">
              <Link
                className="navbar-home-link text-center py-2 text-lg"
                to={routes.register}
                onClick={() => setIsMenuOpen(false)}
              >
                Registrati
              </Link>
              <Link
                className="navbar-home-link text-center py-2 text-lg"
                to={routes.login}
                onClick={() => setIsMenuOpen(false)}
              >
                Accedi
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                to={routes.profile}
                className="flex items-center justify-center gap-3 p-3 rounded-xl bg-[#fef08a]/5 border border-[#fef08a]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full ring-1 ring-[#fef08a]/30"
                />
                <span className="font-bold text-[#fef08a]">
                  {profile?.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-glow btn-glow--danger btn-glow--no-reflect w-full justify-center py-3 flex items-center gap-2"
              >
                <FaArrowRightFromBracket /> Logout
              </button>
            </div>
          )}

          <Link
            className="text-center text-sm text-[#64748b] mt-2 uppercase tracking-widest"
            to={routes.home}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}
