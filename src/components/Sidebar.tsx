import type { AppPage } from "../App";

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
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">PV</div>

        <div>
          <div className="brand-title">PVSM</div>
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