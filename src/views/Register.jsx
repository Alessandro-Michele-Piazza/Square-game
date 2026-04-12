import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../context/user-context";
import routes from "../router/routes";
import "./Register.css";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signUp } = useContext(UserContext);

  const navigate = useNavigate();

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
    <section className="register-screen">
      <div className="register-card">
        <div className="register-card__brand">
          <img
            src="/favicon.svg"
            alt="Square Games logo"
            className="register-card__logo"
          />
          <div>
            <p className="register-card__label">Square Games</p>
            <p className="register-card__subcopy">Register</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="register-form__split">
            <div className="register-form__group">
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                type="text"
                placeholder="Alex"
                {...register("first_name", { required: true })}
              />
              {errors.first_name && (
                <span className="register-form__error">First name is required</span>
              )}
            </div>

            <div className="register-form__group">
              <label htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                type="text"
                placeholder="Player"
                {...register("last_name", { required: true })}
              />
              {errors.last_name && (
                <span className="register-form__error">Last name is required</span>
              )}
            </div>
          </div>

          <div className="register-form__group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="square.runner"
              {...register("username", { required: true })}
            />
            {errors.username && (
              <span className="register-form__error">Username is required</span>
            )}
          </div>

          <div className="register-form__group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="register-form__error">Email is required</span>
            )}
          </div>

          <div className="register-form__group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Choose a secure password"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className="register-form__error">Password is required</span>
            )}
          </div>

          <button type="submit" className="register-form__submit">
            Create account
          </button>
        </form>

        <p className="register-card__footer">
          Already have access? <Link to={routes.login}>Login now</Link>
        </p>
      </div>
    </section>
  );
}
