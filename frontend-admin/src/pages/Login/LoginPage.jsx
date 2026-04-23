import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authStore from "../../store/authStore";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "admin@tapicerialider.com",
    password: "Admin1234!",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authStore.login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <div className="login-page__branding">
          <span className="login-page__eyebrow">Panel de gestión</span>
          <h1>Tapicería Líder</h1>
          <p>
            Accedé al sistema central para administrar clientes, vehículos,
            trabajos, moldes, materiales, productos y finanzas.
          </p>

          <div className="login-page__features">
            <div className="login-page__feature-card">
              <strong>Operación completa</strong>
              <span>Todo el taller centralizado en un solo panel.</span>
            </div>
            <div className="login-page__feature-card">
              <strong>Control técnico</strong>
              <span>Gestión de moldes, stock y flujo de trabajos.</span>
            </div>
            <div className="login-page__feature-card">
              <strong>Escalable</strong>
              <span>Preparado para crecer con más sucursales.</span>
            </div>
          </div>
        </div>

        <div className="login-page__card">
          <div className="login-page__header">
            <h2>Iniciar sesión</h2>
            <p>Ingresá con tu cuenta para continuar</p>
          </div>

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="login-page__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@tapicerialider.com"
                required
              />
            </div>

            <div className="login-page__field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                required
              />
            </div>

            {error ? <div className="login-page__error">{error}</div> : null}

            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar al panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;