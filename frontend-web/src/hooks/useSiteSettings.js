import { useEffect, useState } from "react";
import { getPublicWebsiteSettingsRequest } from "../services/siteSettingsService";
import { companyInfo as localCompanyInfo, siteSections as localSiteSections } from "../data/siteData";

export function useSiteSettings() {
  const [companyInfo, setCompanyInfo] = useState(localCompanyInfo);
  const [siteSections, setSiteSections] = useState(localSiteSections);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoadingSettings(true);
        const response = await getPublicWebsiteSettingsRequest();
        const data = response?.data || {};

        if (data.company_info) {
          setCompanyInfo((prev) => ({
            ...prev,
            ...data.company_info,
          }));
        }

        if (data.site_sections) {
          setSiteSections((prev) => ({
            ...prev,
            ...data.site_sections,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadSettings();
  }, []);

  return {
    companyInfo,
    siteSections,
    loadingSettings,
  };
}