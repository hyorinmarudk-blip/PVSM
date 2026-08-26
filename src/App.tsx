import { useState } from "react";
import AppShell from "./layouts/AppShell";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ServicePage from "./pages/ServicePage";
import SchedulingPage from "./pages/SchedulingPage";
import PartsPage from "./pages/PartsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/App.css";

export type AppPage =
  | "dashboard"
  | "customers"
  | "equipment"
  | "work-orders"
  | "estimates"
  | "invoices"
  | "factory-info"
  | "calendar"
  | "appointments"
  | "inventory"
  | "transactions"
  | "purchase-orders"
  | "suppliers"
  | "reports"
  | "settings";

function App() {
  const [activePage, setActivePage] = useState<AppPage>("dashboard");

const renderPage = () => {
  switch (activePage) {
    case "customers":
    case "equipment":
      return <CustomersPage />;

    case "work-orders":
    case "estimates":
    case "invoices":
    case "factory-info":
      return <ServicePage />;

    case "calendar":
    case "appointments":
      return <SchedulingPage />;

    case "inventory":
    case "transactions":
    case "purchase-orders":
    case "suppliers":
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
