import { Link, useNavigate } from "react-router";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../context/user-context";
import routes from "../router/routes";
import "./Login.css";

export default function Login() {
  const { login } = useContext(UserContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (user_data) => {
    await login({
      email: user_data.email,
      password: user_data.password,
    });
    navigate("/");
  };

  return (
    <section className="login-screen">
      <div className="login-card">
        <div className="login-card__brand">
          <img
            src="/favicon.svg"
            alt="Square Games logo"
            className="login-card__logo"
          />
          <div>
            <p className="login-card__label">Square Games</p>
            <p className="login-card__subcopy">Login</p>
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
            <span className="login-form__error">Email is required</span>
          )}

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Your password"
              {...register("password", { required: true })}
            />
          </label>
          {errors.password && (
            <span className="login-form__error">Password is required</span>
          )}

          <button type="submit" className="login-form__submit">
            Login
          </button>
        </form>

        <p className="login-card__footer">
          New here? <Link to={routes.register}>Create your account</Link>
        </p>
      </div>
    </section>
  );
}
