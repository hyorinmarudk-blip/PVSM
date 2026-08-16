import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getBrandingSettings,
} from "../services/brandingService";

import type {
  BrandingSettings,
} from "../types/branding";

interface BrandingContextValue {
  branding: BrandingSettings | null;
  loading: boolean;
  error: string | null;

  setBranding: (
    branding: BrandingSettings | null,
  ) => void;

  refreshBranding: () => Promise<void>;
}

const BrandingContext =
  createContext<BrandingContextValue | undefined>(
    undefined,
  );

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({
  children,
}: BrandingProviderProps) {
  const [branding, setBranding] =
    useState<BrandingSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshBranding = async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        await getBrandingSettings();

      setBranding(result);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshBranding();
  }, []);

  useEffect(() => {
    if (!branding) return;

    const root =
      document.documentElement;

    root.style.setProperty(
      "--brand-primary",
      branding.primary_color,
    );

    root.style.setProperty(
      "--brand-secondary",
      branding.secondary_color,
    );

    root.style.setProperty(
      "--brand-accent",
      branding.accent_color,
    );

    const applyTheme = () => {
      let resolvedTheme =
        branding.theme_mode;

      if (resolvedTheme === "system") {
        resolvedTheme =
          window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches
            ? "dark"
            : "light";
      }

      root.dataset.theme =
        resolvedTheme;
    };

    applyTheme();

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    media.addEventListener(
      "change",
      applyTheme,
    );

    return () => {
      media.removeEventListener(
        "change",
        applyTheme,
      );
    };
  }, [branding]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        error,
        setBranding,
        refreshBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context =
    useContext(BrandingContext);

  if (!context) {
    throw new Error(
      "useBranding must be used inside BrandingProvider",
    );
  }

  return context;
}