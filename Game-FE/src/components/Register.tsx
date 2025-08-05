import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const schema = yup
  .object({
    fullName: yup.string().required("Full name is required"),
    username: yup
      .string()
      .min(3, "Username must be at least 3 characters")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores"
      )
      .required("Username is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Confirm password is required"),
  })
  .required();

type RegisterFormData = yup.InferType<typeof schema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.register(data);
      console.log("Register data:", response);
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response.data.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign Up</h2>
          <p>Create a new account</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                {...register("fullName")}
                id="fullName"
                type="text"
                className={`form-control ${
                  errors.fullName ? "is-invalid" : ""
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <div className="invalid-feedback">
                  {errors.fullName.message}
                </div>
              )}
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner"></span>}
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Already have an account? Sign in now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
