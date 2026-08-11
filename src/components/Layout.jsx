import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Layout({ tabs, active, onTab, children }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <header className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="DRAGUR"
              className="h-8 object-contain"
              onError={(e) => {
                e.currentTarget.replaceWith(
                  Object.assign(document.createElement("div"), {
                    className: "h-6 w-1.5 bg-green",
                  })
                );
              }}
            />
            <div>
              <h1 className="text-base font-bold leading-none text-ink">
                Gestión de Resellers
              </h1>
              <span className="text-xs text-muted">DRAGUR</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-ink">
                {user?.nombre || user?.email}
              </div>
              <div className="text-xs text-muted">
                {isAdmin ? "Admin" : `Distribuidor · ${user?.reseller || ""}`}
              </div>
            </div>
            <button className="btn-ghost" onClick={logout} title="Salir">
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-2 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className={
                "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors " +
                (active === t.key
                  ? "border-green text-green"
                  : "border-transparent text-muted hover:text-ink")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4">{children}</main>
    </div>
  );
}
