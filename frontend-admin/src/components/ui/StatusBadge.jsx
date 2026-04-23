import "./StatusBadge.css";

function normalizeVariant(value = "") {
  const v = String(value).toLowerCase();

  if (["active", "activa", "activo", "available", "completed", "success", "paid", "delivered", "read"].includes(v)) {
    return "success";
  }

  if (["pending", "medium", "in_progress", "warning"].includes(v)) {
    return "warning";
  }

  if (["inactive", "inactiva", "inactivo", "cancelled", "error", "unpaid", "void", "urgent"].includes(v)) {
    return "danger";
  }

  return "default";
}

function StatusBadge({ children, variant }) {
  const finalVariant = variant || normalizeVariant(children);

  return (
    <span className={`status-badge status-badge--${finalVariant}`}>
      {children}
    </span>
  );
}

export default StatusBadge;