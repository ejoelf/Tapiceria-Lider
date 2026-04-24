import { Link, NavLink } from "react-router-dom";
import { navigationLinks } from "../../data/siteData";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import "./Navbar.css";

function Navbar() {
  const { companyInfo } = useSiteSettings();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark">TL</span>
          <div className="navbar__brand-copy">
            <strong>{companyInfo.name}</strong>
            <small>{companyInfo.slogan}</small>
          </div>
        </Link>

        <nav className="navbar__nav">
          {navigationLinks.map((link) => (
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

        <NavLink to="/contacto" className="navbar__cta">
          Solicitar presupuesto
        </NavLink>
      </div>
    </header>
  );
}

export default Navbar;