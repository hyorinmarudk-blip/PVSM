import type {
  AppPage,
} from "../App";

import {
  useBusiness,
} from "../Context/BusinessContext";

import {
  pageMetadata,
} from "../types/navigation";

interface TopBarProps {
  activePage: AppPage;
}

function TopBar({
  activePage,
}: TopBarProps) {
  const {
    profile,
    loading,
    error,
  } = useBusiness();

  const businessName =
    profile?.business_name?.trim() ||
    "Poteau Valley Services Manager";

  const page =
    pageMetadata[activePage];

  return (
    <header className="top-bar">
      <div>
        <div className="top-bar-business">
          {businessName}
        </div>

        <div className="top-bar-title">
          {page.title}
        </div>

        <div className="top-bar-subtitle">
          {page.description}
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