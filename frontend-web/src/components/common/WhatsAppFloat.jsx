import { useSiteSettings } from "../../hooks/useSiteSettings";
import "./WhatsAppFloat.css";

function WhatsAppFloat() {
  const { companyInfo } = useSiteSettings();

  const phoneRaw = companyInfo.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || "543584000000";
  const normalizedPhone = String(phoneRaw).replace(/\D/g, "");

  const message = encodeURIComponent(
    "Hola, quiero consultar por un trabajo o producto de Tapicería Líder."
  );

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${normalizedPhone}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <span className="whatsapp-float__icon">✆</span>
      <span className="whatsapp-float__label">WhatsApp</span>
    </a>
  );
}

export default WhatsAppFloat;