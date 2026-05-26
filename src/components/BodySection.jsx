import { FaPaperPlane, FaTrash } from "react-icons/fa6";
import supabase from "../database/supabase";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/user-context";
import Placeholder from "../media/Portrait_Placeholder.png";
import "../css/components/Reviews.css";

function AvatarImg({ avatarUrl }) {
  const [src, setSrc] = useState(Placeholder);

  useEffect(() => {
    if (!avatarUrl) {
      setSrc(Placeholder);
      return;
    }

    if (avatarUrl.startsWith("http")) {
      setSrc(avatarUrl);
      return;
    }

    supabase.storage
      .from("avatars")
      .createSignedUrl(avatarUrl, 3600)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          setSrc(Placeholder);
        } else {
          setSrc(data.signedUrl);
        }
      });
  }, [avatarUrl]);

  return (
    <img
      src={src}
      alt="Avatar utente"
      className="review-avatar-img"
      onError={(event) => {
        event.currentTarget.onerror = null;
        setSrc(Placeholder);
      }}
    />
  );
}

export default function BodySection({ game }) {
  const { user, profile } = useContext(UserContext);
  const ownerId = user?.id ?? null;
  const [description, setDescription] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const hasFetched = useRef(false);

  /* ── fetch reviews ── */
  const fetchReviews = async () => {
    if (!game?.id) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(username, avatar_url)")
      .eq("game_id", game.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);

      /* Fallback: query senza join se la relazione non esiste */
      const { data: plain, error: plainErr } = await supabase
        .from("reviews")
        .select("*")
        .eq("game_id", game.id)
        .order("created_at", { ascending: false });

      if (plainErr) {
        console.error("Reviews plain fetch error:", plainErr);
        setReviews([]);
      } else {
        setReviews(plain ?? []);
      }
    } else {
      setReviews(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    void fetchReviews();
  }, [game?.id]);

  /* ── submit review ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!ownerId || !game?.id || !trimmed || submitting) return;

    setSubmitting(true);

    const { error } = await supabase
      .from("reviews")
      .insert({
        profile_id: ownerId,
        game_id: Number(game.id),
        description: trimmed,
      });

    if (error) {
      console.error("Review insert error:", error);
    } else {
      setDescription("");
      hasFetched.current = false;
      await fetchReviews();
    }

    setSubmitting(false);
  };

  /* ── delete own review ── */
  const handleDelete = async (reviewId) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Review delete error:", error);
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <span className="reviews-badge">Community</span>
        <h3 className="reviews-title">Reviews</h3>
        <p className="reviews-count">
          {reviews.length} {reviews.length === 1 ? "recensione" : "recensioni"}
        </p>
      </div>

      {/* ── Form (solo utenti autenticati) ── */}
      {ownerId ? (
        <form className="reviews-form" onSubmit={handleSubmit}>
          <div className="reviews-form__avatar">
            <AvatarImg avatarUrl={profile?.avatar_url} />
          </div>
          <div className="reviews-form__body">
            <textarea
              className="reviews-form__textarea"
              rows={3}
              placeholder="Scrivi la tua recensione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <div className="reviews-form__footer">
              <span className="reviews-form__chars">
                {description.length}/1000
              </span>
              <button
                type="submit"
                className="btn-glow btn-glow--yellow btn-glow--no-reflect reviews-form__submit"
                disabled={submitting || !description.trim()}
              >
                <FaPaperPlane />
                {submitting ? "Invio..." : "Pubblica"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="reviews-login-hint">
          Accedi per lasciare una recensione.
        </p>
      )}

      {/* ── Lista recensioni ── */}
      <div className="reviews-list">
        {loading ? (
          <div className="reviews-empty">
            <p>Caricamento recensioni...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>Nessuna recensione ancora. Sii il primo!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-card__avatar">
                <AvatarImg avatarUrl={review.profiles?.avatar_url} />
              </div>
              <div className="review-card__content">
                <div className="review-card__header">
                  <span className="review-card__author">
                    {review.profiles?.username ?? "Utente anonimo"}
                  </span>
                  <span className="review-card__date">
                    {formatReviewDate(review.created_at)}
                  </span>
                </div>
                <p className="review-card__text">{review.description}</p>
              </div>
              {ownerId === review.profile_id && (
                <button
                  className="review-card__delete"
                  onClick={() => handleDelete(review.id)}
                  title="Elimina recensione"
                >
                  <FaTrash />
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
