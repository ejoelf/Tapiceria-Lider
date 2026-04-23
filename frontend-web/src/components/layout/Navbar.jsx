import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/servicios", label: "Servicios" },
  { to: "/trabajos", label: "Trabajos" },
  { to: "/productos", label: "Productos" },
  { to: "/contacto", label: "Contacto" },
];

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span>Tapicería Líder</span>
        </NavLink>

        <nav className="navbar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a className="navbar__cta" href="/contacto">
          Solicitar presupuesto
        </a>
      </div>
    </header>
  );
}

export default Navbar;