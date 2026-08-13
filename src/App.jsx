import React, { useMemo, useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import DataModule from "./components/DataModule.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ReportesMensual from "./components/ReportesMensual.jsx";
import { NAV, MODULE_CONFIG } from "./lib/tableConfig.js";

export default function App() {
  const { user, isAdmin } = useAuth();

  const nav = useMemo(
    () => NAV.filter((n) => (n.adminOnly ? isAdmin : true)),
    [isAdmin]
  );

  const [activeTop, setActiveTop] = useState(nav[0]?.key);
  const [subTabs, setSubTabs] = useState({}); // groupKey -> subKey

  if (!user) return <Login />;

  const current = nav.find((n) => n.key === activeTop) || nav[0];

  return (
    <Layout tabs={nav} active={current?.key} onTab={setActiveTop}>
      {renderContent(current, subTabs, setSubTabs)}
    </Layout>
  );
}

function renderContent(entry, subTabs, setSubTabs) {
  if (!entry) return null;

  if (entry.type === "dashboard") return <Dashboard />;

  if (entry.type === "data") {
    return <DataModule key={entry.key} module={MODULE_CONFIG[entry.key]} />;
  }

  if (entry.type === "group") {
    const subKey = subTabs[entry.key] || entry.tabs[0].key;
    const sub = entry.tabs.find((t) => t.key === subKey) || entry.tabs[0];
    return (
      <div>
        <div className="flex gap-1 mb-4 border-b border-line">
          {entry.tabs.map((t) => (
            <button
              key={t.key}
              onClick={() =>
                setSubTabs((prev) => ({ ...prev, [entry.key]: t.key }))
              }
              className={
                "px-4 py-2 text-sm font-medium -mb-px border-b-2 " +
                (sub.key === t.key
                  ? "border-green text-green"
                  : "border-transparent text-muted hover:text-ink")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        {renderSub(sub)}
      </div>
    );
  }

  return null;
}

function renderSub(sub) {
  if (sub.type === "data") {
    return <DataModule key={sub.key} module={MODULE_CONFIG[sub.key]} />;
  }
  if (sub.type === "mensual") {
    return <ReportesMensual />;
  }
  return null;
}
