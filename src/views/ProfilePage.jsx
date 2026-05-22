import { startTransition, useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { UserContext } from "../context/user-context";
import { FaBookmark, FaHeart, FaTrash } from "react-icons/fa6";
import supabase from "../database/supabase";
import routes from "../router/routes";
import Placeholder from "../assets/Portrait_Placeholder.png";
import "./profile_update.css";

const GAME_PREVIEW_FALLBACK =
  "https://placehold.co/240x135/081120/e2e8f0?text=No+Image";

function handleAvatarError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = Placeholder;
}

function handleGamePreviewError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = GAME_PREVIEW_FALLBACK;
}

export default function ProfilePage() {
  const { user, profile } = useContext(UserContext);
  const [avatarSource, setAvatarSource] = useState(Placeholder);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userWantToPlay, setUserWantToPlay] = useState([]);
  const [gamePreviewById, setGamePreviewById] = useState({});
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

  useEffect(() => {
    const rawgKey = import.meta.env.VITE_RAWG_KEY;

    if (!rawgKey) {
      return;
    }

    const allGameIds = [...userFavorites, ...userWantToPlay]
      .map((entry) => Number(entry?.game_id))
      .filter((id) => Number.isFinite(id));

    const uniqueIds = [...new Set(allGameIds)];
    const idsToFetch = uniqueIds.filter(
      (id) => !Object.prototype.hasOwnProperty.call(gamePreviewById, id),
    );

    if (idsToFetch.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadGamePreviews = async () => {
      const previewEntries = await Promise.all(
        idsToFetch.map(async (gameId) => {
          try {
            const response = await fetch(
              `https://api.rawg.io/api/games/${gameId}?key=${rawgKey}`,
            );

            if (!response.ok) {
              return [gameId, null];
            }

            const game = await response.json();
            const previewUrl =
              game?.background_image || game?.background_image_additional || null;

            return [gameId, previewUrl];
          } catch {
            return [gameId, null];
          }
        }),
      );

      if (isCancelled) {
        return;
      }

      setGamePreviewById((prev) => {
        const next = { ...prev };

        previewEntries.forEach(([gameId, previewUrl]) => {
          next[gameId] = previewUrl;
        });

        return next;
      });
    };

    void loadGamePreviews();

    return () => {
      isCancelled = true;
    };
  }, [gamePreviewById, userFavorites, userWantToPlay]);

  if (!user) {
    return (
      <main className="profile-shell">
        <section className="profile-panel profile-panel--empty">
          <h1 className="profile-title">Sessione non disponibile</h1>
          <p className="profile-lead" id="card_login_failed">
            Effettua l&apos;accesso per vedere il tuo profilo e modificare i
            dati.
          </p>
          <Link
            className="profile-button profile-button--primary profile-empty-action"
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
  const favoriteCountLabel = `${userFavorites.length} ${
    userFavorites.length === 1 ? "gioco salvato" : "giochi salvati"
  }`;
  const wantToPlayCountLabel = `${userWantToPlay.length} ${
    userWantToPlay.length === 1 ? "gioco salvato" : "giochi salvati"
  }`;

  const handleRemoveFavorite = async (favoriteId) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (!error) {
      setUserFavorites((prev) => prev.filter((entry) => entry.id !== favoriteId));
    }
  };

  const handleRemoveWantToPlay = async (itemId) => {
    const { error } = await supabase
      .from("want_to_play")
      .delete()
      .eq("id", itemId);

    if (!error) {
      setUserWantToPlay((prev) => prev.filter((entry) => entry.id !== itemId));
    }
  };

  const getGamePreviewSource = (entry) => {
    const inlinePreview =
      entry?.game_image ||
      entry?.background_image ||
      entry?.cover ||
      entry?.cover_url ||
      entry?.image_url ||
      entry?.poster_url;

    if (inlinePreview) {
      return inlinePreview;
    }

    const fetchedPreview = gamePreviewById[Number(entry?.game_id)];
    return fetchedPreview || GAME_PREVIEW_FALLBACK;
  };

  return (
    <main className="profile-shell">
      <section className="profile-panel profile-panel--profile">
        <div className="profile-overview">
          <div className="profile-overview__content">
            <p className="profile-overview__eyebrow">Area personale</p>
            <h1 className="profile-title">Control Room</h1>
            <p className="profile-lead">
              Tutti i dettagli del tuo account in una vista piu leggibile, con
              accesso immediato alle impostazioni e alle tue raccolte.
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

          <article className="profile-summary">
            <div className="profile-avatar-frame">
              <img
                src={avatarSource}
                alt="Avatar profilo"
                className="profile-avatar"
                onError={handleAvatarError}
              />
            </div>
            <h2 className="profile-name">
              {profile?.username || "Player one"}
            </h2>
            <p className="profile-subtitle">
              {fullName || "Nome da completare"}
            </p>

            <dl className="profile-meta" aria-label="Dettagli account">
              {details.map((detail) => (
                <div key={detail.label} className="profile-meta-row">
                  <dt className="profile-meta-row__label">{detail.label}</dt>
                  <dd className="profile-meta-row__value">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <section className="profile-collections" aria-label="Le tue raccolte">
          <article className="profile-collection profile-collection--favorites">
            <header className="profile-collection__header">
              <h2 className="profile-collection__title">
                <FaHeart className="profile-collection__title-icon" />
                Preferiti
              </h2>
              <p className="profile-collection__count">{favoriteCountLabel}</p>
            </header>

            {userFavorites.length > 0 ? (
              <ul className="profile-games-list">
                {userFavorites.map((fav) => (
                  <li key={fav.id} className="profile-game-item">
                    <div className="profile-game-item__main">
                      <div className="profile-game-item__poster-frame">
                        <img
                          src={getGamePreviewSource(fav)}
                          alt={`Anteprima di ${fav.game_name}`}
                          className="profile-game-item__poster"
                          loading="lazy"
                          onError={handleGamePreviewError}
                        />
                      </div>

                      <div className="profile-game-item__content">
                        <h3 className="profile-game-item__name">{fav.game_name}</h3>
                        <Link
                          to={`/detail/${fav.game_id}`}
                          className="profile-game-link"
                        >
                          Visualizza dettagli
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        void handleRemoveFavorite(fav.id);
                      }}
                      className="profile-icon-button profile-icon-button--danger"
                      title="Rimuovi dai preferiti"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <article className="profile-empty-list">
                <FaHeart className="profile-empty-list__icon" />
                <p>Nessun gioco salvato nei preferiti.</p>
                <Link to={routes.home} className="profile-game-link">
                  Esplora i giochi
                </Link>
              </article>
            )}
          </article>

          <article className="profile-collection profile-collection--wishlist">
            <header className="profile-collection__header">
              <h2 className="profile-collection__title">
                <FaBookmark className="profile-collection__title-icon" />
                Want to play
              </h2>
              <p className="profile-collection__count">{wantToPlayCountLabel}</p>
            </header>

            {userWantToPlay.length > 0 ? (
              <ul className="profile-games-list">
                {userWantToPlay.map((item) => (
                  <li key={item.id} className="profile-game-item">
                    <div className="profile-game-item__main">
                      <div className="profile-game-item__poster-frame">
                        <img
                          src={getGamePreviewSource(item)}
                          alt={`Anteprima di ${item.game_name}`}
                          className="profile-game-item__poster"
                          loading="lazy"
                          onError={handleGamePreviewError}
                        />
                      </div>

                      <div className="profile-game-item__content">
                        <h3 className="profile-game-item__name">{item.game_name}</h3>
                        <Link
                          to={`/detail/${item.game_id}`}
                          className="profile-game-link"
                        >
                          Visualizza dettagli
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        void handleRemoveWantToPlay(item.id);
                      }}
                      className="profile-icon-button"
                      title="Rimuovi da want to play"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <article className="profile-empty-list">
                <FaBookmark className="profile-empty-list__icon" />
                <p>Nessun gioco salvato in Want to play.</p>
                <Link to={routes.home} className="profile-game-link">
                  Esplora i giochi
                </Link>
              </article>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
