import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatelessMessage from "../../components/ui/StatelessMessage";
import { getSettingsRequest } from "../../services/settingsService";
import { saveWebsiteSettingsRequest } from "../../services/websiteSettingsService";
import "./SettingsPage.css";

const initialCompanyInfo = {
  name: "",
  slogan: "",
  shortDescription: "",
  phone: "",
  whatsapp: "",
  email: "",
  city: "",
  address: "",
  instagram: "",
  facebook: "",
  youtube: "",
};

const initialSections = {
  homeServices: true,
  homeWorks: true,
  homeProducts: true,
  homeCourses: true,
  homeWhyUs: true,
  homeCoverage: true,
};

function SettingsPage() {
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [siteSections, setSiteSections] = useState(initialSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const response = await getSettingsRequest();
        const rows = response?.data || [];

        const companyInfoRow = rows.find((item) => item.key === "company_info");
        const siteSectionsRow = rows.find((item) => item.key === "site_sections");

        if (companyInfoRow?.value) {
          setCompanyInfo((prev) => ({
            ...prev,
            ...companyInfoRow.value,
          }));
        }

        if (siteSectionsRow?.value) {
          setSiteSections((prev) => ({
            ...prev,
            ...siteSectionsRow.value,
          }));
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudieron cargar los ajustes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (event) => {
    const { name, checked } = event.target;
    setSiteSections((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      await saveWebsiteSettingsRequest({
        company_info: companyInfo,
        site_sections: siteSections,
      });

      setSuccess("Ajustes del sitio guardados correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron guardar los ajustes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Configuración"
        description="Administrá los datos públicos y la activación de secciones del sitio web."
      />

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}
      {success ? <StatelessMessage type="success">{success}</StatelessMessage> : null}

      {loading ? (
        <StatelessMessage>Cargando configuración...</StatelessMessage>
      ) : (
        <form className="settings-page__form" onSubmit={handleSubmit}>
          <SectionCard title="Datos generales del sitio">
            <div className="settings-page__body">
              <div className="settings-page__grid">
                <div className="settings-page__field">
                  <label>Nombre</label>
                  <input
                    name="name"
                    value={companyInfo.name}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Slogan</label>
                  <input
                    name="slogan"
                    value={companyInfo.slogan}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field settings-page__field--full">
                  <label>Descripción corta</label>
                  <textarea
                    name="shortDescription"
                    rows="4"
                    value={companyInfo.shortDescription}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Teléfono</label>
                  <input
                    name="phone"
                    value={companyInfo.phone}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>WhatsApp</label>
                  <input
                    name="whatsapp"
                    value={companyInfo.whatsapp}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Email</label>
                  <input
                    name="email"
                    value={companyInfo.email}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Ciudad</label>
                  <input
                    name="city"
                    value={companyInfo.city}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field settings-page__field--full">
                  <label>Dirección</label>
                  <input
                    name="address"
                    value={companyInfo.address}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Instagram</label>
                  <input
                    name="instagram"
                    value={companyInfo.instagram}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>Facebook</label>
                  <input
                    name="facebook"
                    value={companyInfo.facebook}
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="settings-page__field">
                  <label>YouTube</label>
                  <input
                    name="youtube"
                    value={companyInfo.youtube}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Secciones activas de Home">
            <div className="settings-page__body">
              <div className="settings-page__checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="homeServices"
                    checked={siteSections.homeServices}
                    onChange={handleSectionChange}
                  />
                  Servicios
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="homeWorks"
                    checked={siteSections.homeWorks}
                    onChange={handleSectionChange}
                  />
                  Trabajos
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="homeProducts"
                    checked={siteSections.homeProducts}
                    onChange={handleSectionChange}
                  />
                  Productos
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="homeCourses"
                    checked={siteSections.homeCourses}
                    onChange={handleSectionChange}
                  />
                  Cursos
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="homeWhyUs"
                    checked={siteSections.homeWhyUs}
                    onChange={handleSectionChange}
                  />
                  Por qué elegirnos
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="homeCoverage"
                    checked={siteSections.homeCoverage}
                    onChange={handleSectionChange}
                  />
                  Cobertura
                </label>
              </div>
            </div>
          </SectionCard>

          <div className="settings-page__actions">
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar ajustes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SettingsPage;