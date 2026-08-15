import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DatabaseHealth {
  connected: boolean;
  database_path: string;
  sqlite_version: string;
  schema_version: number;
}

function DashboardPage() {
  const [database, setDatabase] =
    useState<DatabaseHealth | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    invoke<DatabaseHealth>("database_health")
      .then(setDatabase)
      .catch((reason) => setError(String(reason)));
  }, []);

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Your shop overview and daily activity will appear here.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="summary-card">
          <span>Today's Jobs</span>
          <strong>0</strong>
        </div>

        <div className="summary-card">
          <span>Open Work Orders</span>
          <strong>0</strong>
        </div>

        <div className="summary-card">
          <span>Appointments</span>
          <strong>0</strong>
        </div>

        <div className="summary-card">
          <span>Inventory Alerts</span>
          <strong>0</strong>
        </div>
      </div>

      <div className="panel">
        <h2>Database Foundation</h2>

        {error && (
          <p>
            Database error: {error}
          </p>
        )}

        {!database && !error && (
          <p>Connecting to SQLite...</p>
        )}

        {database && (
          <>
            <p>
              <strong>Status:</strong>{" "}
              {database.connected ? "Connected" : "Disconnected"}
            </p>

            <p>
              <strong>SQLite:</strong>{" "}
              {database.sqlite_version}
            </p>

            <p>
              <strong>Schema:</strong>{" "}
              {database.schema_version}
            </p>

            <p>
              <strong>Database:</strong>{" "}
              {database.database_path}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
