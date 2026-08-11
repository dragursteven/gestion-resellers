import React, { useMemo, useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import DataModule from "./components/DataModule.jsx";
import { MODULES } from "./lib/tableConfig.js";

export default function App() {
  const { user, isAdmin } = useAuth();

  const tabs = useMemo(
    () => MODULES.filter((m) => (m.adminOnly ? isAdmin : true)),
    [isAdmin]
  );

  const [active, setActive] = useState(tabs[0]?.key);

  if (!user) return <Login />;

  const current =
    tabs.find((t) => t.key === active) || tabs[0];

  return (
    <Layout
      tabs={tabs}
      active={current?.key}
      onTab={setActive}
    >
      {current ? <DataModule key={current.key} module={current} /> : null}
    </Layout>
  );
}
