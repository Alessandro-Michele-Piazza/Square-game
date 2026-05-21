import { startTransition, useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { UserContext } from "../context/user-context";
import { FaBookmark, FaHeart, FaTrash } from "react-icons/fa6";
import supabase from "../database/supabase";
import routes from "../router/routes";
import Placeholder from "../assets/Portrait_Placeholder.png";
import "./profile_update.css";

function handleAvatarError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = Placeholder;
}

export default function ProfilePage() {
  const { user, profile } = useContext(UserContext);
  const [avatarSource, setAvatarSource] = useState(Placeholder);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userWantToPlay, setUserWantToPlay] = useState([]);
  const ownerId = profile?.id ?? user?.id ?? null;

  useEffect(() => {
    const loadCollections = async () => {
      if (!ownerId) {
        setUserFavorites([]);
        setUserWantToPlay([]);
        return;
      }

      const [favoritesResult, wantToPlayResult] = await Promise.all([
        supabase
          .from("favorites")
          .select("*")
          .eq("profile_id", ownerId)
          .order("id", { ascending: false }),
        supabase
          .from("want_to_play")
          .select("*")
          .eq("profile_id", ownerId)
          .order("id", { ascending: false }),
      ]);

      const { data: favorites, error: favoritesError } = favoritesResult;
      const { data: wantToPlay, error: wantToPlayError } = wantToPlayResult;

      if (favoritesError) {
        console.error("Favorites fetch error:", favoritesError.message);
        setUserFavorites([]);
      } else {
        setUserFavorites(favorites ?? []);
      }

      if (wantToPlayError) {
        console.error("Want to play fetch error:", wantToPlayError.message);
        setUserWantToPlay([]);
      } else {
        setUserWantToPlay(wantToPlay ?? []);
      }
    };

    void loadCollections();
  }, [ownerId]);

  useEffect(() => {
    if (!profile?.avatar_url) {
      startTransition(() => {
        setAvatarSource(Placeholder);
      });
      return;
    }

    if (profile.avatar_url.startsWith("http")) {
      startTransition(() => {
        setAvatarSource(profile.avatar_url);
      });
      return;
    }

    supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_url, 3600)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          startTransition(() => {
            setAvatarSource(Placeholder);
          });
        } else {
          startTransition(() => {
            setAvatarSource(data.signedUrl);
          });
        }
      });
  }, [profile?.avatar_url]);

  if (!user) {
    return (
      <main className="profile-shell">
        <section className="profile-panel profile-panel--empty">
          <span className="profile-badge mb-5">Account area</span>
          <h1 className="profile-title mb-5">Sessione non disponibile</h1>
          <div className="profile-lead mb-5" id="card_login_failed">
            Effettua l&apos;accesso per vedere il tuo profilo e modificare i
            dati.
          </div>
          <Link
            className="profile-button profile-button--primary inline-block mt-4"
            to={routes.login}
          >
            Accedi ora
          </Link>
          </section>  

      </main>
    );
  }

  const memberSince = user.created_at
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(user.created_at))
    : "Non disponibile";
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const details = [
    { label: "Email", value: user.email || "Non disponibile" },
    { label: "Nome completo", value: fullName || "Da completare" },
    { label: "Username", value: profile?.username || "Da impostare" },
    { label: "Membro dal", value: memberSince },
  ];
  const statusCards = [
    { label: "Stato profilo", value: profile ? "Online" : "In sync" },
    { label: "Avatar", value: profile?.avatar_url ? "Custom" : "Default" },
    { label: "Pronto per", value: "Modifiche rapide" },
  ];

  return (
    <main className="profile-shell">
      <section className="profile-panel">
        <div className="profile-hero">
          <div className="profile-hero__content">
            <span className="profile-badge mb-5">Player profile</span>
            <h1 className="profile-title mb-5">Control Room</h1>
            <p className="profile-lead mb-5">
              Tutti i dettagli del tuo account in una vista piu leggibile, con
              accesso rapido alle modifiche principali.
            </p>
            <div className="profile-action-row">
              <Link
                className="profile-button profile-button--primary"
                to={routes.profile_settings}
              >
                Modifica profilo
              </Link>
              <Link
                className="profile-button profile-button--secondary"
                to={routes.home}
              >
                Torna alla home
              </Link>
            </div>
          </div>

          <article className="profile-card profile-card--hero">
            <div className="profile-avatar-frame">
              <img
                src={avatarSource}
                alt="Avatar profilo"
                className="profile-avatar"
                onError={handleAvatarError}
              />
            </div>
            <span className="profile-chip">online identity</span>
            <h2 className="profile-name">
              {profile?.username || "Player one"}
            </h2>
            <p className="profile-subtitle">
              {fullName || "Nome da completare"}
            </p>
          </article>
        </div>

        <section className="profile-stats-grid" aria-label="Stato profilo">
          {statusCards.map((card) => (
            <article key={card.label} className="profile-stat-card">
              <span className="profile-stat-card__label">{card.label}</span>
              <strong className="profile-stat-card__value">{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="profile-details-grid" aria-label="Dettagli account">
          {details.map((detail) => (
            <article key={detail.label} className="profile-detail-card">
              <span className="profile-detail-card__label">{detail.label}</span>
              <strong className="profile-detail-card__value">
                {detail.value}
              </strong>
            </article>
          ))}
        </section>

        <section className="mt-12" aria-label="Giochi preferiti">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-red-400">
              <FaHeart className="mr-1.5 inline-block text-xs" />
              Preferiti
            </span>
            <span className="text-sm text-[#94a3b8]">
              {userFavorites.length}{" "}
              {userFavorites.length === 1 ? "gioco" : "giochi"}
            </span>
          </div>

          {userFavorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {userFavorites.map((fav) => (
                <article
                  key={fav.id}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#071121]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#7dd3fc]/25 hover:shadow-[0_8px_32px_rgba(56,189,248,0.06)]"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                      <FaHeart className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">
                        {fav.game_name}
                      </h3>
                      <Link
                        to={`/detail/${fav.game_id}`}
                        className="text-xs font-medium text-[#7dd3fc] transition hover:text-white"
                      >
                        Visualizza dettagli →
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("favorites")
                        .delete()
                        .eq("id", fav.id);
                      if (!error) {
                        setUserFavorites((prev) =>
                          prev.filter((f) => f.id !== fav.id),
                        );
                      }
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#94a3b8] opacity-0 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    title="Rimuovi dai preferiti"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <article className="rounded-2xl border border-white/10 bg-[#071121]/60 p-8 text-center backdrop-blur-xl">
              <FaHeart className="mx-auto mb-3 text-2xl text-[#475569]" />
              <p className="text-sm font-semibold text-[#94a3b8]">
                Nessun gioco salvato nei preferiti.
              </p>
              <Link
                to={routes.home}
                className="mt-3 inline-block text-xs font-semibold text-[#7dd3fc] transition hover:text-white"
              >
                Esplora i giochi →
              </Link>
            </article>
          )}
        </section>

        <section className="mt-12" aria-label="Giochi want to play">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-amber-300">
              <FaBookmark className="mr-1.5 inline-block text-xs" />
              Want to play
            </span>
            <span className="text-sm text-[#94a3b8]">
              {userWantToPlay.length}{" "}
              {userWantToPlay.length === 1 ? "gioco" : "giochi"}
            </span>
          </div>

          {userWantToPlay.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {userWantToPlay.map((item) => (
                <article
                  key={item.id}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#071121]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-300/30 hover:shadow-[0_8px_32px_rgba(251,191,36,0.08)]"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10">
                      <FaBookmark className="text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">
                        {item.game_name}
                      </h3>
                      <Link
                        to={`/detail/${item.game_id}`}
                        className="text-xs font-medium text-[#7dd3fc] transition hover:text-white"
                      >
                        Visualizza dettagli →
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("want_to_play")
                        .delete()
                        .eq("id", item.id);
                      if (!error) {
                        setUserWantToPlay((prev) =>
                          prev.filter((entry) => entry.id !== item.id),
                        );
                      }
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#94a3b8] opacity-0 transition-all duration-200 hover:border-amber-400/35 hover:bg-amber-500/10 hover:text-amber-300 group-hover:opacity-100"
                    title="Rimuovi da want to play"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <article className="rounded-2xl border border-white/10 bg-[#071121]/60 p-8 text-center backdrop-blur-xl">
              <FaBookmark className="mx-auto mb-3 text-2xl text-[#475569]" />
              <p className="text-sm font-semibold text-[#94a3b8]">
                Nessun gioco salvato in Want to play.
              </p>
              <Link
                to={routes.home}
                className="mt-3 inline-block text-xs font-semibold text-[#7dd3fc] transition hover:text-white"
              >
                Esplora i giochi →
              </Link>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
