import { Link, useLoaderData, useNavigate } from "react-router";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../context/user-context";
import routes from "../router/routes";
import "./Login.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


export default function Login() {
  const { login } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { bgImage } = useLoaderData();

  const onSubmit = async (user_data) => {
    await login({
      email: user_data.email,
      password: user_data.password,
    });
    navigate("/");
  };

  return (
    <section className="login-split">
      <div className="login-split__image">
        {bgImage && <img src={bgImage} alt="Random game" />}
        <div className="login-split__overlay" />
      </div>

      <div className="login-split__form">
        <div className="login-card__brand">
          <img
            src="/favicon.svg"
            alt="Square Games logo"
            className="login-card__logo"
          />
          <div>
            <p className="login-card__label">Square Games</p>
            <p className="login-card__subcopy">Pagina di login</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: true })}
            />
          </label>
          {errors.email && (
            <span className="login-form__error">L'email è richiesta</span>
          )}

          <label className="login-form__field">
            <span>Password</span>
            <div className="login-form__password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="La tua password"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                className="register-form__show-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {/* Molto più semplice e leggibile */}
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>
          {errors.password && (
            <span className="login-form__error">La password è richiesta</span>
          )}

          <button type="submit" className="login-form__submit">
            Accedi
          </button>
        </form>

        <p className="login-card__footer">
          Nuovo qui? <Link to={routes.register}>Crea il tuo account</Link>
        </p>
      </div>
    </section>
  );
}
