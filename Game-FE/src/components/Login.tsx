import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const schema = yup
  .object({
    username: yup
      .string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  .required();

type LoginFormData = yup.InferType<typeof schema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Thêm dòng này

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authAPI.login(data);
      console.log("Login data:", result);
      login(result.accessToken);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response.data.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Sign in to your account</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                type="text"
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <div className="invalid-feedback">
                  {errors.username.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner"></span>}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/register" className="auth-link">
              Don't have an account? Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
