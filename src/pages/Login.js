import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl + "/api/login", { email, password });
      if (response.data.result === "success") {
        setAuthenticated(true);
        navigate("mainpage");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Error logging in");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleLoginWindow = window.open(
        apiUrl + "/api/google_login",
        "Google Login",
        "width=500,height=600"
      );

      window.addEventListener("message", async (event) => {
        if (event.data.result === "success") {
          setAuthenticated(true);
          window.location.href = "mainpage";
        } else {
          setError("Error logging in with Google");
        }
        googleLoginWindow.close();
      }, false);
    } catch (err) {
      setError("Error logging in with Google");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
