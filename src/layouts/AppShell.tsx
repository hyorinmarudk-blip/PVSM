import type { ReactNode } from "react";
import type { AppPage } from "../App";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

interface AppShellProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: ReactNode;
}

function AppShell({
  activePage,
  onNavigate,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="app-main">
        <TopBar activePage={activePage} />

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;