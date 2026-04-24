import { Link } from "react-router-dom";
import { companyInfo, navigationLinks } from "../../data/siteData";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__eyebrow">Tapicería vehicular premium</span>
          <h3>{companyInfo.name}</h3>
          <p>{companyInfo.shortDescription}</p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>Navegación</h4>
            <div className="footer__links">
              {navigationLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4>Contacto</h4>
            <p>{companyInfo.phone}</p>
            <p>{companyInfo.email}</p>
            <p>{companyInfo.address}</p>
          </div>

          <div className="footer__col">
            <h4>Operación</h4>
            <p>Tapizado de volantes</p>
            <p>Tapicería vehicular</p>
            <p>Limpieza de tapizados</p>
            <p>Productos y cursos</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;