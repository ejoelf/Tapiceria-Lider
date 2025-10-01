import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './components/Home'
import SobreMi from './components/SobreMi'
import Contacto from './components/Contacto'
import Trabajos from './components/Trabajos'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()  
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [location.pathname])  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen)
    }

  return (
    <div className="App">
     
      <nav className="navbar">
        <div className="nav-container">
          
          <Link to="/" className="nav-logo">
            <img src="../public/logo/volante.png" alt="Logo Volante" className="nav-logo-img" />
            Tapicería Líder
          </Link>

         
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Inicio</Link></li>
            <li><Link to="/sobre-mi" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sobre Mí</Link></li>
            <li><Link to="/trabajos" className="nav-link" onClick={() => setIsMenuOpen(false)}>Trabajos</Link></li> 
            <li><Link to="/contacto" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contacto</Link></li>
          </ul>

          
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        
        {isMenuOpen && (
          <div className="mobile-social">
            <a href="https://www.instagram.com/tapiceria.lider" target="_blank" rel="noopener noreferrer" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.facebook.com/tapiceria.lider" target="_blank" rel="noopener noreferrer" title="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://www.youtube.com/@tapiceria.lider" target="_blank" rel="noopener noreferrer" title="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        )}
      </nav>

      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre-mi" element={<SobreMi />} />
        <Route path="/trabajos" element={<Trabajos />} />  
        <Route path="/contacto" element={<Contacto />} />
      </Routes>

      
      <footer className="footer">
        <p>&copy; 2025 Tapicería Líder. Todos los derechos reservados.</p>
        <div className="social-icons">
          <a href="https://www.instagram.com/tapiceria.lider" target="_blank" rel="noopener noreferrer" title="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com/tapiceria.lider" target="_blank" rel="noopener noreferrer" title="Facebook">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://www.youtube.com/@tapiceria.lider" target="_blank" rel="noopener noreferrer" title="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
        <p className="footer-credit">Creada por <a href="https://nexo-digital.tech" target="_blank" rel="noopener noreferrer">NexoDigital</a></p>  
      </footer>

      
      <a 
        href="https://wa.me/+5493584901015?text=¡Hola!%20Estoy%20interesado%20en%20servicios%20de%20tapicería%20para%20mi%20auto.%20¿Podrías%20darme%20más%20info?" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        title="Chatea con nosotros en WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  )
}

export default App