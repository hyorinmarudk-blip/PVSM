import { useState } from "react";
import AppShell from "./layouts/AppShell";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ServicePage from "./pages/ServicePage";
import SchedulingPage from "./pages/SchedulingPage";
import PartsPage from "./pages/PartsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/app.css";

export type AppPage =
  | "dashboard"
  | "customers"
  | "service"
  | "scheduling"
  | "parts"
  | "reports"
  | "settings";

function App() {
  const [activePage, setActivePage] = useState<AppPage>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "customers":
        return <CustomersPage />;
      case "service":
        return <ServicePage />;
      case "scheduling":
        return <SchedulingPage />;
      case "parts":
        return <PartsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
