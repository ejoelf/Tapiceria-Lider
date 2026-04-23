import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="public-not-found">
      <div className="public-not-found__card">
        <span>Página no encontrada</span>
        <h1>404</h1>
        <p>La sección que buscás no existe o fue movida.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}

export default NotFoundPage;