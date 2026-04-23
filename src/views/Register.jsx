import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../context/user-context";
import routes from "../router/routes";
import { useState } from "react";
import "./Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useContext(UserContext);

  const navigate = useNavigate();
  const { bgImage } = useLoaderData();

  const onSubmit = async (user_data) => {
    await signUp({
      email: user_data.email,
      password: user_data.password,
      options: {
        data: {
          first_name: user_data.first_name,
          last_name: user_data.last_name,
          username: user_data.username,
        },
      },
    });
    navigate("/");
  };

  return (
    <section className="register-split">
      <div className="register-split__image">
        {bgImage && <img src={bgImage} alt="Random game" />}
        <div className="register-split__overlay" />
      </div>

      <div className="register-split__form">
        <div className="register-card__brand">
          <img
            src="/favicon.svg"
            alt="Square Games logo"
            className="register-card__logo"
          />
          <div>
            <p className="register-card__label">Square Games</p>
            <p className="register-card__subcopy">Pagina di registrazione</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="register-form__split">
            <div className="register-form__group">
              <label htmlFor="first_name">Nome</label>
              <input
                id="first_name"
                type="text"
                placeholder="Alex"
                {...register("first_name", {
                  required: "Il nome è richiesto",
                })}
              />
              {errors.first_name && (
                <span className="register-form__error">
                  {errors.first_name.message}
                </span>
              )}
            </div>

            <div className="register-form__group">
              <label htmlFor="last_name">Cognome</label>
              <input
                id="last_name"
                type="text"
                placeholder="Player"
                {...register("last_name", {
                  required: "Il cognome è richiesto",
                  pattern: {
                    value: /^\S+$/,
                    message: "Il cognome non può contenere spazi",
                  },
                })}
              />
              {errors.last_name && (
                <span className="register-form__error">
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

          <div className="register-form__group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="square.runner"
              {...register("username", {
                required: "Lo username è richiesto",
                pattern: {
                  value: /^\S+$/,
                  message: "Lo username non può contenere spazi",
                },
              })}
            />
            {errors.username && (
              <span className="register-form__error">
                {errors.username.message}
              </span>
            )}
          </div>

          <div className="register-form__group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "L'email è richiesta",
                pattern: {
                  value: /^\S+$/,
                  message: "L'email non può contenere spazi",
                },
              })}
            />
            {errors.email && (
              <span className="register-form__error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="register-form__group">
            <label htmlFor="password">Password</label>

            <div className="register-form__password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Scegli una password sicura"
                {...register("password", {
                  required: "La password è richiesta",
                  pattern: {
                    value: /^\S+$/,
                    message: "La password non può contenere spazi",
                  },
                })}
              />
              {errors.password && (
                <span className="register-form__error">
                  {errors.password.message}
                </span>
              )}
              <button
                type="button"
                className="register-form__show-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {/* Molto più semplice e leggibile */}
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type="submit" className="register-form__submit">
            Crea account
          </button>
        </form>

        <p className="register-card__footer">
          Hai già un account? <Link to={routes.login}>Accedi ora</Link>
        </p>
      </div>
    </section>
  );
}
