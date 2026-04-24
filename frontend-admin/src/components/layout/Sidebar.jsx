import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/clients", label: "Clientes" },
  { to: "/vehicles", label: "Vehículos" },
  { to: "/work-orders", label: "Trabajos" },
  { to: "/materials", label: "Materiales" },
  { to: "/molds", label: "Moldes" },
  { to: "/employees", label: "Empleados" },
  { to: "/products", label: "Productos" },
  { to: "/finances", label: "Finanzas" },
  { to: "/notifications", label: "Notificaciones" },
  { to: "/master-catalogs", label: "Catálogos maestros" },
  { to: "/monthly-summary", label: "Resumen mensual" },
  { to: "/exports", label: "Exportaciones" },
  { to: "/settings", label: "Configuración" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h2>Tapicería Líder</h2>
        <span>Panel Admin</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;