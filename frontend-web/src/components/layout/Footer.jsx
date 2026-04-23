import { companyInfo } from "../../data/siteData";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <h3>{companyInfo.name}</h3>
          <p>{companyInfo.slogan}</p>
        </div>

        <div className="footer__cols">
          <div>
            <h4>Contacto</h4>
            <p>{companyInfo.phone}</p>
            <p>{companyInfo.email}</p>
            <p>{companyInfo.city}</p>
          </div>

          <div>
            <h4>Secciones</h4>
            <p>Nosotros</p>
            <p>Servicios</p>
            <p>Trabajos</p>
            <p>Productos</p>
          </div>

          <div>
            <h4>Redes</h4>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>YouTube</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;