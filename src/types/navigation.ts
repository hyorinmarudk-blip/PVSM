import type {
  AppPage,
} from "../App";

export interface PageMetadata {
  title: string;
  description: string;
}

export const pageMetadata:
  Record<AppPage, PageMetadata> = {
    dashboard: {
      title: "Dashboard",
      description:
        "Business overview and daily activity",
    },

    customers: {
      title: "Customers",
      description:
        "Customer records and history",
    },

    equipment: {
      title: "Equipment",
      description:
        "Vehicles, small engines, and equipment",
    },

    "work-orders": {
      title: "Work Orders",
      description:
        "Active and historical repair jobs",
    },

    estimates: {
      title: "Estimates",
      description:
        "Customer repair estimates",
    },

    invoices: {
      title: "Invoices",
      description:
        "Billing and manual payment records",
    },

    "factory-info": {
      title: "Factory Information",
      description:
        "Service manuals and technical information",
    },

    calendar: {
      title: "Calendar",
      description:
        "Shop schedule",
    },

    appointments: {
      title: "Appointments",
      description:
        "Customer appointments",
    },

    inventory: {
      title: "Inventory",
      description:
        "Parts and stock management",
    },

    transactions: {
      title: "Inventory Transactions",
      description:
        "Inventory movement history",
    },

    "purchase-orders": {
      title: "Purchase Orders",
      description:
        "Parts purchasing and receiving",
    },

    suppliers: {
      title: "Suppliers",
      description:
        "Parts suppliers and vendors",
    },

    reports: {
      title: "Reports",
      description:
        "Business and operational reporting",
    },

    settings: {
      title: "Settings",
      description:
        "Business, branding, and application configuration",
    },
  };