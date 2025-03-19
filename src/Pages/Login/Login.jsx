import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const checkPassword = (password) => {
    
    return password.length>0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkPassword(password)) {
      setError("La password deve essere lunga almeno 8 caratteri, contenere una lettera maiuscola e un numero.");
      return;
    }

    try {
      const response = await fetch("https://maturita.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/documents");
      } else {
        setError(data.message || "Errore durante la richiesta di login.");
      }
    } catch (error) {
      console.error("Errore durante la richiesta:", error);
      setError("Si è verificato un errore. Riprova.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="form">
        <h2 style={{ color: "black" }}>Log in to your account</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="input-container">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit">
          Log in
        </button>

        <p className="signup-link">
          No account? <a href="/register">Sign up</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
