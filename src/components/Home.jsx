import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const galeriaData = [
  {
    id: 1,
    img: '/image/volante1.jpeg',
    titulo: 'Volante en Cuero Rojo Premium',
    descripcion: 'Tapizado completo en cuero rojo premium con costuras decorativas. Ideal para un look deportivo y elegante.',
    materiales: 'Cuero genuino italiano, hilo reforzado, espuma de alta densidad.'
  },
  {
    id: 2,
    img: '/image/volante2.jpeg',
    titulo: 'Volante Alcantara Negro',
    descripcion: 'Volante alcántara negro con detalles deportivos y perforaciones para mejor agarre.',
    materiales: 'Alcantara sintética, inserciones de aluminio, adhesivo profesional.'
  },
  {
    id: 3,
    img: '/image/volante3.jpeg',
    titulo: 'Volante Personalizado con Madera',
    descripcion: 'Volante personalizado con inserción de madera y cuero para un estilo único y ergonómico.',
    materiales: 'Cuero premium, madera noble, bordado a mano.'
  }
]

function Home() {
  const [selectedGaleria, setSelectedGaleria] = useState(null)  

  const openModal = (galeria) => setSelectedGaleria(galeria)  
  const closeModal = () => setSelectedGaleria(null)  

  return (
    <main className="main-content">  
      
      <section className="hero fade-in">
        <h1>Tapicería Líder</h1>
        <p>Especialistas en tapizado de volantes de autos. Calidad y estilo para tu vehículo.</p>
        <Link to="/contacto" className="btn">Contáctanos</Link>  
      </section>

      
      <section className="section fade-in">
        <h2>Nuestros Servicios</h2>
        <p>Ofrecemos tapizado profesional de volantes para autos de todas las marcas. Usamos materiales de alta calidad como cuero genuino, alcántara y telas resistentes. Personalizamos colores y diseños para que tu volante se vea único.</p>
        <ul className="servicios-list">  
          <li>
            <i className="fas fa-couch"></i>  
            <span>Tapizado en cuero</span>
          </li>
          <li>
            <i className="fas fa-palette"></i>  
            <span>Diseños personalizados</span>
          </li>
          <li>
            <i className="fas fa-tools"></i>  
            <span>Reparaciones rápidas</span>
          </li>
          <li>
            <i className="fas fa-car"></i>  
            <span>Instalación en el lugar</span>
          </li>
        </ul>
      </section>

      
      <section className="section fade-in">
        <h2>Nuestros de Trabajos</h2>
        <p>Algunos de nuestros volantes tapizados. ¡Haz clic en una imagen para ver detalles o "Ver Más" para el portfolio completo!</p>

        <div className="galeria-home">
          {galeriaData.map((galeria) => (  
            <img 
              key={galeria.id}
              src={galeria.img}
              alt={galeria.titulo}
              onClick={() => openModal(galeria)}
              style={{ cursor: 'pointer' }} 
            />
          ))}
        </div>

        <div className="ver-mas-btn">
          <Link to="/trabajos" className="btn">Ver Más</Link>  
        </div>
      </section>

      
      {selectedGaleria && (
        <div className="modal-overlay" onClick={closeModal}>  
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>  
            <button className="modal-close" onClick={closeModal}>×</button> 
            <img src={selectedGaleria.img} alt={selectedGaleria.titulo} />
            <div className="modal-desc">
              <h2>{selectedGaleria.titulo}</h2>
              <p>{selectedGaleria.descripcion}</p>
              <p><strong>Materiales:</strong> {selectedGaleria.materiales}</p>
              <Link to="/trabajos" className="btn" onClick={closeModal}>Ir a Trabajos</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home
