import type { AppPage } from "../App";
import { useBusiness } from "../context/BusinessContext";

import {
  useBranding,
} from "../context/BrandingContext";

import {
  loadBrandImage,
} from "../services/brandingService";

import {
  useEffect,
  useState,
} from "react";

interface SidebarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navigation: { id: AppPage; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "Customers" },
  { id: "service", label: "Service" },
  { id: "scheduling", label: "Scheduling" },
  { id: "parts", label: "Parts" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const { profile } = useBusiness();

  const { branding } =
  useBranding();

const [logo, setLogo] =
  useState<string | null>(null);

  const businessName =
    profile?.business_name?.trim() || "PVSM";

    useEffect(() => {
  if (!branding?.logo_path) {
    setLogo(null);
    return;
  }

  loadBrandImage(
    branding.logo_path,
  )
    .then((image) => {
      setLogo(
        image.data_url,
      );
    })
    .catch(() => {
      setLogo(null);
    });
}, [branding?.logo_path]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
  {logo ? (
    <img
      src={logo}
      alt=""
      className="sidebar-logo"
    />
  ) : (
    "PV"
  )}
</div>

        <div>
          <div className="brand-title">{businessName}</div>
          <div className="brand-subtitle">Version 6</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={
              activePage === item.id
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Local Mode
      </div>
    </aside>
  );
}

export default Sidebar;