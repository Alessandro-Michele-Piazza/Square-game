import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user-context";
import routes from "../router/routes";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import supabase from "../database/supabase";
import Placeholder from "../media/Portrait_Placeholder.png";
import "../css/views/profile_update.css";

function handleAvatarError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = Placeholder;
}

export default function ProfileSettingsPage() {
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(Placeholder);
  const { user, profile, updateProfile } = useContext(UserContext);
  const navigate = useNavigate();

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

  const avatarSource = preview || avatarUrl;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
    },
  });

  useEffect(() => {
    reset({
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      username: profile?.username ?? "",
    });
  }, [profile, reset]);

  const handleChange = (e) => {
    const nextFile = e.target.files?.[0];
    setFile(nextFile);
  };

  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      // Rimuovi il vecchio avatar dallo storage (se esiste)
      if (profile?.avatar_url && !profile.avatar_url.startsWith("http")) {
        await supabase.storage.from("avatars").remove([profile.avatar_url]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError.message);
        setUploadMessage({ type: "error", text: `Upload fallito: ${uploadError.message}` });
        return;
      }

      const { error: profileError } = await updateProfile({ avatar_url: fileName });

      if (profileError) {
        setUploadMessage({ type: "error", text: `Aggiornamento profilo fallito: ${profileError.message}` });
        return;
      }

      // Genera un signed URL per mostrare subito il nuovo avatar
      const { data: signedData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(fileName, 3600);

      if (signedData?.signedUrl) {
        setAvatarUrl(signedData.signedUrl);
      }

      setFile(undefined);
      setUploadMessage({ type: "success", text: "Avatar aggiornato con successo!" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    await updateProfile(data);
    navigate(routes.profile);
  };

  if (!user) {
    return (
      <main className="profile-shell">
        <section className="profile-panel profile-panel--empty">
          <h1 className="profile-title profile-empty-intro-item">Accesso richiesto</h1>
          <p className="profile-lead profile-empty-intro-item">
            Devi effettuare il login prima di modificare il profilo.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-shell profile-shell--settings">
      <section className="profile-panel">
        <header className="profile-settings-header">
          <h1 className="profile-title">Tune your identity</h1>
          <p className="profile-lead">
            Aggiorna i dati principali e prova il nuovo avatar prima di salvarlo.
          </p>
        </header>

        <div className="profile-settings-layout">
          <form onSubmit={handleSubmit(onSubmit)} className="profile-card profile-settings-form">
            <div className="profile-form-grid">
              <label className="profile-input-group">
                <span className="profile-input-label">First name</span>
                <input
                  type="text"
                  className="profile-text-input"
                  placeholder="Inserisci il nome"
                  {...register("first_name", { required: "This field is required" })}
                />
                {errors.first_name && (
                  <span className="profile-settings-form__error">
                    {errors.first_name.message}
                  </span>
                )}
              </label>

              <label className="profile-input-group">
                <span className="profile-input-label">Last name</span>
                <input
                  type="text"
                  className="profile-text-input"
                  placeholder="Inserisci il cognome"
                  {...register("last_name", { required: "This field is required" })}
                />
                {errors.last_name && (
                  <span className="profile-settings-form__error">
                    {errors.last_name.message}
                  </span>
                )}
              </label>

              <label className="profile-input-group profile-input-group--full">
                <span className="profile-input-label">Username</span>
                <input
                  type="text"
                  className="profile-text-input"
                  placeholder="Scegli uno username"
                  {...register("username", {
                    required: "This field is required",
                    minLength: {
                      value: 3,
                      message: "Use at least 3 characters",
                    },
                  })}
                />
                {errors.username && (
                  <span className="profile-settings-form__error">
                    {errors.username.message}
                  </span>
                )}
              </label>
            </div>

            <div className="profile-action-row">
              <button
                type="submit"
                className="profile-button profile-button--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
              </button>
              <Link className="profile-button profile-button--ghost" to={routes.profile}>
                Torna al profilo
              </Link>
            </div>
          </form>

          <aside className="profile-card profile-upload-card">
            <div className="profile-upload-preview-frame">
              <img
                src={avatarSource}
                alt="Anteprima avatar"
                className="profile-avatar"
                onError={handleAvatarError}
              />
            </div>

            <div className="profile-upload-copy">
              <h2 className="profile-name">{profile?.username || "Player one"}</h2>
              <p className="profile-subtitle">
                Carica un&apos;immagine nuova e aggiornala direttamente sul bucket avatars.
              </p>
            </div>

            <form className="profile-upload-form" onSubmit={handleAvatarSubmit}>
              <label className="profile-input-group">
                <span className="profile-input-label">Nuovo avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="profile-file-input"
                  onChange={handleChange}
                />
              </label>
              <button
                type="submit"
                className="profile-button profile-button--secondary"
                disabled={!file || isUploading}
              >
                {isUploading ? "Upload in corso..." : "Aggiorna avatar"}
              </button>
              {avatarUrl && avatarUrl !== Placeholder && (
                <p className="profile-upload-feedback profile-upload-feedback--success">
                  ✓ Avatar caricato
                </p>
              )}
              {uploadMessage && (
                <p className={`profile-upload-feedback profile-upload-feedback--${uploadMessage.type}`}>
                  {uploadMessage.text}
                </p>
              )}
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}
