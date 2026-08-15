function DashboardPage() {
  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Your shop overview and daily activity will appear here.</p>
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
        <h2>PVSM 6 Foundation</h2>
        <p>
          The application shell is running successfully.
          Business modules will be connected as each phase is completed.
        </p>
      </div>
    </section>
  );
}

export default DashboardPage;