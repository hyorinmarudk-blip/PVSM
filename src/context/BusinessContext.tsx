import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getBusinessConfiguration,
  getBusinessProfile,
} from "../services/businessService";

import type {
  BusinessConfiguration,
  BusinessProfile,
} from "../types/business";

interface BusinessContextValue {
  profile: BusinessProfile | null;
  configuration: BusinessConfiguration | null;

  loading: boolean;
  error: string | null;

  refreshBusiness: () => Promise<void>;

  setProfile: (
    profile: BusinessProfile | null,
  ) => void;

  setConfiguration: (
    configuration: BusinessConfiguration | null,
  ) => void;
}

const BusinessContext =
  createContext<BusinessContextValue | undefined>(
    undefined,
  );

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({
  children,
}: BusinessProviderProps) {
  const [profile, setProfile] =
    useState<BusinessProfile | null>(null);

  const [configuration, setConfiguration] =
    useState<BusinessConfiguration | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshBusiness = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        businessProfile,
        businessConfiguration,
      ] = await Promise.all([
        getBusinessProfile(),
        getBusinessConfiguration(),
      ]);

      setProfile(businessProfile);
      setConfiguration(businessConfiguration);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshBusiness();
  }, []);

  return (
    <BusinessContext.Provider
      value={{
        profile,
        configuration,
        loading,
        error,
        refreshBusiness,
        setProfile,
        setConfiguration,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider",
    );
  }

  return context;
}