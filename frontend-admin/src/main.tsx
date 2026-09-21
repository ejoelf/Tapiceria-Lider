import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="error-boundary">
        <h1>No pudimos mostrar esta pantalla.</h1>
        <p>Recargá la página para volver a intentarlo.</p>
        <button onClick={() => window.location.reload()}>Recargar</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </React.StrictMode>,
);
