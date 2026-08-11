import React, { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(String(err.message || "No se pudo iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="DRAGUR"
            className="h-16 mb-3 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="h-1 w-10 bg-green mb-3" />
          <h1 className="text-xl font-bold text-ink">Gestión de Resellers</h1>
          <p className="text-sm text-muted">DRAGUR</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          ) : null}

          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
