import "./WhatsAppFloat.css";

function WhatsAppFloat() {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "543584000000";
  const message = encodeURIComponent(
    "Hola, quiero consultar por un trabajo de tapicería para mi vehículo."
  );

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <span>W</span>
    </a>
  );
}

export default WhatsAppFloat;