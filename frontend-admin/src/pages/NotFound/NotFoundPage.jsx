import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__card">
        <span className="not-found-page__eyebrow">Error de navegación</span>
        <h1>404</h1>
        <p>
          La página que buscás no existe o fue movida dentro del sistema.
        </p>
        <Link to="/">Volver al dashboard</Link>
      </div>
    </div>
  );
}

export default NotFoundPage;