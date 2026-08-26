import {
  useEffect,
  useState,
} from "react";

import type { AppPage } from "../App";

import {
  useBusiness,
} from "../Context/BusinessContext";

import {
  useBranding,
} from "../Context/BrandingContext";

import {
  loadBrandImage,
} from "../services/brandingService";

interface SidebarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

interface NavigationItem {
  id: AppPage;
  label: string;
}

interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

const navigation: NavigationGroup[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
      },
    ],
  },

  {
    label: "Customers",
    items: [
      {
        id: "customers",
        label: "Customers",
      },
      {
        id: "equipment",
        label: "Equipment",
      },
    ],
  },

  {
    label: "Service",
    items: [
      {
        id: "work-orders",
        label: "Work Orders",
      },
      {
        id: "estimates",
        label: "Estimates",
      },
      {
        id: "invoices",
        label: "Invoices",
      },
      {
        id: "factory-info",
        label: "Factory Information",
      },
    ],
  },

  {
    label: "Scheduling",
    items: [
      {
        id: "calendar",
        label: "Calendar",
      },
      {
        id: "appointments",
        label: "Appointments",
      },
    ],
  },

  {
    label: "Parts",
    items: [
      {
        id: "inventory",
        label: "Inventory",
      },
      {
        id: "transactions",
        label: "Transactions",
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders",
      },
      {
        id: "suppliers",
        label: "Suppliers",
      },
    ],
  },

  {
    items: [
      {
        id: "reports",
        label: "Reports",
      },
      {
        id: "settings",
        label: "Settings",
      },
    ],
  },
];

function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const { profile } = useBusiness();
  const { branding } = useBranding();

  const [logo, setLogo] =
    useState<string | null>(null);

  useEffect(() => {
    if (!branding?.logo_path) {
      setLogo(null);
      return;
    }

    loadBrandImage(
      branding.logo_path,
    )
      .then((image) => {
        setLogo(image.data_url);
      })
      .catch(() => {
        setLogo(null);
      });
  }, [branding?.logo_path]);

  const businessName =
    profile?.business_name?.trim() ||
    "PVSM";

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

        <div className="sidebar-brand-text">
          <div className="brand-title">
            {businessName}
          </div>

          <div className="brand-subtitle">
            PVSM Version 6
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map(
          (group, groupIndex) => (
            <div
              className="nav-group"
              key={
                group.label ??
                `group-${groupIndex}`
              }
            >
              {group.label && (
                <div className="nav-group-label">
                  {group.label}
                </div>
              )}

              {group.items.map(
                (item) => (
                  <button
                    key={item.id}
                    className={
                      activePage === item.id
                        ? "nav-button active"
                        : "nav-button"
                    }
                    onClick={() =>
                      onNavigate(item.id)
                    }
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Local Mode
      </div>
    </aside>
  );
}

export default Sidebar;