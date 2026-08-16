import { useBusiness } from "../context/BusinessContext";

function TopBar() {
  const {
    profile,
    loading,
    error,
  } = useBusiness();

  const businessName =
    profile?.business_name.trim() ||
    "Poteau Valley Services Manager";


  return (
    <header className="top-bar">
      <div>
        <div className="brand-title">
            {businessName}
        </div>

        <div className="top-bar-subtitle">
          PVSM 6
        </div>
      </div>

      <div className="top-bar-status">
        <span className="status-dot" />

        {loading
          ? "Loading"
          : error
            ? "Configuration Error"
            : "Ready"}
      </div>
    </header>
  );
}

export default TopBar;