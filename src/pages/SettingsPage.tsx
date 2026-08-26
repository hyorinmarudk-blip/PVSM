import { useEffect, useState } from "react";

import {
  saveBusinessConfiguration,
  saveBusinessProfile,
} from "../services/businessService";

import type {
  BusinessConfiguration,
  BusinessProfile,
} from "../types/business";

import { useBusiness } from "../Context/BusinessContext";

import { useBranding } from "../Context/BrandingContext";

import {
  saveBrandingSettings,
  importBrandImage,
  loadBrandImage,
  deleteBrandImage,
} from "../services/brandingService";

import type {
  BrandingSettings,
} from "../types/branding";

import { open } from "@tauri-apps/plugin-dialog";

function SettingsPage() {
  const {
    profile: globalProfile,
    configuration: globalConfiguration,
    setProfile: setGlobalProfile,
    setConfiguration: setGlobalConfiguration,
  } = useBusiness();

  const {
    branding: globalBranding,
    setBranding: setGlobalBranding,
  } = useBranding();

  const [logoPreview, setLogoPreview] =
  useState<string | null>(null);

  const [headerPreview, setHeaderPreview] =
  useState<string | null>(null);

  const [profile, setProfile] =
    useState<BusinessProfile | null>(
      globalProfile,
    );

  const [config, setConfig] =
    useState<BusinessConfiguration | null>(
      globalConfiguration,
    );

  const [branding, setBranding] =
    useState<BrandingSettings | null>(
      globalBranding,
    );

  const [loading, setLoading] = useState(true);

  const [status, setStatus] =
    useState<string>("");

      useEffect(() => {
    setBranding(globalBranding);
  }, [globalBranding]);

  useEffect(() => {
    setProfile(globalProfile);
    setConfig(globalConfiguration);

    if (
      globalProfile &&
      globalConfiguration
    ) {
      setLoading(false);
    }
  }, [
    globalProfile,
    globalConfiguration,
  ]);

  useEffect(() => {
    if (!globalBranding) {
      setLogoPreview(null);
      setHeaderPreview(null);
      return;
    }

    if (globalBranding.logo_path) {
      loadBrandImage(
        globalBranding.logo_path,
      )
        .then((image) => {
          setLogoPreview(
            image.data_url,
          );
        })
        .catch(() => {
          setLogoPreview(null);
        });
    } else {
      setLogoPreview(null);
    }

    if (
      globalBranding.header_image_path
    ) {
      loadBrandImage(
        globalBranding.header_image_path,
      )
        .then((image) => {
          setHeaderPreview(
            image.data_url,
          );
        })
        .catch(() => {
          setHeaderPreview(null);
        });
    } else {
      setHeaderPreview(null);
    }
  }, [globalBranding]);

  const chooseLogo = async () => {
    if (!branding) return;

    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Images",
          extensions: [
            "png",
            "jpg",
            "jpeg",
            "webp",
            "gif",
          ],
        },
      ],
    });

    if (
      !selected ||
      Array.isArray(selected)
    ) {
      return;
    }

    try {
      const imported =
        await importBrandImage(
          selected,
          "logo",
        );

      const updated = {
        ...branding,
        logo_path: imported.path,
      };

      setBranding(updated);

      setLogoPreview(
        imported.data_url,
      );
    } catch (error) {
      setStatus(
        `Unable to import logo: ${error}`,
      );
    }
  };

  const chooseHeaderImage =
    async () => {
      if (!branding) return;

      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Images",
            extensions: [
              "png",
              "jpg",
              "jpeg",
              "webp",
              "gif",
            ],
          },
        ],
      });

      if (
        !selected ||
        Array.isArray(selected)
      ) {
        return;
      }

      try {
        const imported =
          await importBrandImage(
            selected,
            "header",
          );

        const updated = {
          ...branding,
          header_image_path:
            imported.path,
        };

        setBranding(updated);

        setHeaderPreview(
          imported.data_url,
        );
      } catch (error) {
        setStatus(
          `Unable to import header image: ${error}`,
        );
      }
    };

  const removeLogo = async () => {
    if (
      !branding ||
      !branding.logo_path
    ) {
      return;
    }

    try {
      await deleteBrandImage(
        branding.logo_path,
      );

      setBranding({
        ...branding,
        logo_path: null,
      });

      setLogoPreview(null);
    } catch (error) {
      setStatus(
        `Unable to remove logo: ${error}`,
      );
    }
  };

  const removeHeaderImage =
    async () => {
      if (
        !branding ||
        !branding.header_image_path
      ) {
        return;
      }

      try {
        await deleteBrandImage(
          branding.header_image_path,
        );

        setBranding({
          ...branding,
          header_image_path: null,
        });

        setHeaderPreview(null);
      } catch (error) {
        setStatus(
          `Unable to remove header image: ${error}`,
        );
      }
    };

  const updateProfile = (
    field: keyof BusinessProfile,
    value: string,
  ) => {
    if (!profile) return;

    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const updateNumber = (
    field: keyof BusinessConfiguration,
    value: string,
  ) => {
    if (!config) return;

    const number = Number(value);

    setConfig({
      ...config,
      [field]: Number.isFinite(number)
        ? number
        : 0,
    });
  };

  const updateConfigText = (
    field: keyof BusinessConfiguration,
    value: string,
  ) => {
    if (!config) return;

    setConfig({
      ...config,
      [field]: value,
    });
  };

  const save = async () => {
    if (!profile || !config) return;

    setStatus("Saving...");

    try {
      const savedProfile =
        await saveBusinessProfile(profile);

      const savedConfig =
        await saveBusinessConfiguration(config);
        setGlobalProfile(savedProfile);
        setGlobalConfiguration(savedConfig);

      setProfile(savedProfile);
      setConfig(savedConfig);

      if (branding) {
  const savedBranding =
    await saveBrandingSettings(
      branding,
    );

  setBranding(savedBranding);
  setGlobalBranding(savedBranding);
}

      setStatus("Business settings saved.");
    } catch (error) {
      setStatus(`Save failed: ${error}`);
    }
  };

  if (loading) {
    return (
      <section>
        <h1>Settings</h1>
        <p>Loading business configuration...</p>
      </section>
    );
  }

  if (!profile || !config) {
    return (
      <section>
        <h1>Settings</h1>
        <p>{status || "Settings could not be loaded."}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Business Settings</h1>
          <p>
            Configure the business using this installation
            of PVSM.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={save}
        >
          Save Settings
        </button>
      </div>

      {status && (
        <div className="settings-status">
          {status}
        </div>
      )}

      <div className="settings-grid">
        <div className="panel">
          <h2>Business Profile</h2>

          <div className="form-grid">
            <label>
              Business Name
              <input
                value={profile.business_name}
                onChange={(event) =>
                  updateProfile(
                    "business_name",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              DBA
              <input
                value={profile.dba_name}
                onChange={(event) =>
                  updateProfile(
                    "dba_name",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Legal Name
              <input
                value={profile.legal_name}
                onChange={(event) =>
                  updateProfile(
                    "legal_name",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Phone
              <input
                value={profile.phone}
                onChange={(event) =>
                  updateProfile(
                    "phone",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Email
              <input
                value={profile.email}
                onChange={(event) =>
                  updateProfile(
                    "email",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Website
              <input
                value={profile.website}
                onChange={(event) =>
                  updateProfile(
                    "website",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        {branding && (
  <div className="panel">
    <h2>Branding & Appearance</h2>

    <div className="form-grid">

        <div className="branding-image-section">
  <h3>Business Logo</h3>

  <div className="branding-image-row">
    <div className="branding-preview logo-preview">
      {logoPreview ? (
        <img
          src={logoPreview}
          alt="Business logo"
        />
      ) : (
        <span>No logo selected</span>
      )}
    </div>

    <div className="branding-image-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={chooseLogo}
      >
        Choose Logo
      </button>

      {branding.logo_path && (
        <button
          type="button"
          className="danger-button"
          onClick={removeLogo}
        >
          Remove
        </button>
      )}
    </div>
  </div>
</div>

<div className="branding-image-section">
  <h3>Header / Brand Image</h3>

  <div className="branding-image-row">
    <div className="branding-preview header-preview">
      {headerPreview ? (
        <img
          src={headerPreview}
          alt="Header branding"
        />
      ) : (
        <span>
          No header image selected
        </span>
      )}
    </div>

    <div className="branding-image-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={chooseHeaderImage}
      >
        Choose Header Image
      </button>

      {branding.header_image_path && (
        <button
          type="button"
          className="danger-button"
          onClick={removeHeaderImage}
        >
          Remove
        </button>
      )}
    </div>
  </div>
</div>

      <label>
        Primary Color
        <input
          type="color"
          value={
            branding.primary_color
          }
          onChange={(event) =>
            setBranding({
              ...branding,
              primary_color:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Secondary Color
        <input
          type="color"
          value={
            branding.secondary_color
          }
          onChange={(event) =>
            setBranding({
              ...branding,
              secondary_color:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Accent Color
        <input
          type="color"
          value={
            branding.accent_color
          }
          onChange={(event) =>
            setBranding({
              ...branding,
              accent_color:
                event.target.value,
            })
          }
        />
      </label>

      <label>
        Theme
        <select
          value={branding.theme_mode}
          onChange={(event) =>
            setBranding({
              ...branding,
              theme_mode:
                event.target.value as
                  | "light"
                  | "dark"
                  | "system",
            })
          }
        >
          <option value="system">
            System
          </option>

          <option value="light">
            Light
          </option>

          <option value="dark">
            Dark
          </option>
        </select>
      </label>

    </div>
  </div>
)}

        <div className="panel">
          <h2>Address</h2>

          <div className="form-grid">
            <label className="full-width">
              Address
              <input
                value={profile.address_line_1}
                onChange={(event) =>
                  updateProfile(
                    "address_line_1",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-width">
              Address Line 2
              <input
                value={profile.address_line_2}
                onChange={(event) =>
                  updateProfile(
                    "address_line_2",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              City
              <input
                value={profile.city}
                onChange={(event) =>
                  updateProfile(
                    "city",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              State
              <input
                value={profile.state}
                onChange={(event) =>
                  updateProfile(
                    "state",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              ZIP
              <input
                value={profile.postal_code}
                onChange={(event) =>
                  updateProfile(
                    "postal_code",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Country
              <input
                value={profile.country}
                onChange={(event) =>
                  updateProfile(
                    "country",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-width">
              Service Area
              <input
                value={profile.service_area}
                onChange={(event) =>
                  updateProfile(
                    "service_area",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className="panel">
          <h2>Service Defaults</h2>

          <div className="form-grid">
            <label>
              Sales Tax Rate
              <input
                type="number"
                step="0.001"
                value={config.sales_tax_rate}
                onChange={(event) =>
                  updateNumber(
                    "sales_tax_rate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Shop Labor Rate
              <input
                type="number"
                step="0.01"
                value={config.shop_labor_rate}
                onChange={(event) =>
                  updateNumber(
                    "shop_labor_rate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Mobile Labor Rate
              <input
                type="number"
                step="0.01"
                value={config.mobile_labor_rate}
                onChange={(event) =>
                  updateNumber(
                    "mobile_labor_rate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Diagnostic Fee
              <input
                type="number"
                step="0.01"
                value={config.diagnostic_fee}
                onChange={(event) =>
                  updateNumber(
                    "diagnostic_fee",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className="panel">
          <h2>Document Defaults</h2>

          <div className="form-grid">
            <label className="full-width">
              Work Order Footer
              <textarea
                value={config.work_order_footer}
                onChange={(event) =>
                  updateConfigText(
                    "work_order_footer",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-width">
              Estimate Footer
              <textarea
                value={config.estimate_footer}
                onChange={(event) =>
                  updateConfigText(
                    "estimate_footer",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-width">
              Invoice Footer
              <textarea
                value={config.invoice_footer}
                onChange={(event) =>
                  updateConfigText(
                    "invoice_footer",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-width">
              Warranty Text
              <textarea
                value={config.warranty_text}
                onChange={(event) =>
                  updateConfigText(
                    "warranty_text",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;