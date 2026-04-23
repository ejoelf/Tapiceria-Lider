import authStore from "../../store/authStore";
import "./Topbar.css";

function Topbar() {
  const user = authStore.getUser();

  const handleLogout = () => {
    authStore.logout();
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1>Panel de administración</h1>
        <p>Gestión integral de Tapicería Líder</p>
      </div>

      <div className="topbar__right">
        <div className="topbar__user">
          <strong>
            {user?.first_name || "Usuario"} {user?.last_name || ""}
          </strong>
          <span>{user?.role?.name || "Sin rol"}</span>
        </div>

        <button className="topbar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Topbar;