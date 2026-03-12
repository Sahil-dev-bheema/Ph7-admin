import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import ForgotPass from "../components/ForgotPass.jsx";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email field is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password field is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isValid = validate();
    if (!isValid) return;

    try {
      setLoading(true);

      const { data } = await axiosInstance.post("/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (data?.success) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        navigate(from, { replace: true });
      } else {
        setError(data?.message || "Incorrect email or password");
      }
    } catch (err) {
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (status === 401 || status === 400) {
        setError("Incorrect email or password");
      } else {
        setError(backendMessage || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError("");

    setErrors((prev) => ({
      ...prev,
      email: value.trim() ? "" : "Email field is required",
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError("");

    setErrors((prev) => ({
      ...prev,
      password: value.trim() ? "" : "Password field is required",
    }));
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">
            Admin Login
          </h2>

          {error && (
            <p className="mb-4 text-sm text-red-600 text-center font-medium">
              {error}
            </p>
          )}

          {/* EMAIL */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {import.meta.env.VITE_FLAG_V === "V1" && (
            <div className="mb-4 text-right">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-medium transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {import.meta.env.VITE_FLAG_V === "V1" && (
        <ForgotPass
          open={forgotOpen}
          onClose={() => setForgotOpen(false)}
          defaultEmail={email}
        />
      )}
    </>
  );
};

export default AdminLogin;