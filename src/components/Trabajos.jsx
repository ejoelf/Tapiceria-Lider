import { useState } from 'react'

const trabajosData = [ 
  {
    id: 1,
    img: '/image/volante1.jpeg', 
    titulo: 'Volante en Cuero Rojo Premium',
    descripcion: 'Tapizado completo en cuero genuino rojo con costuras dobles. Materiales: Cuero italiano, hilo reforzado. Ideal para autos deportivos.',
    materiales: 'Cuero genuino, espuma de alta densidad, hilo náutico.'
  },
  {
    id: 2,
    img: '/image/volante2.jpeg', 
    titulo: 'Volante Alcantara Negro',
    descripcion: 'Revestimiento en Alcantara con perforaciones para mejor agarre. Materiales: Alcantara sintética, aluminio interior.',
    materiales: 'Alcantara, inserciones de carbono, adhesivo profesional.'
  },
  {
    id: 3,
    img: '/image/volante3.jpeg',  
    titulo: 'Volante Personalizado Azul',
    descripcion: 'Diseño custom con logos bordados y grip ergonómico. Materiales: Cuero azul marino, bordado a mano.',
    materiales: 'Cuero premium, hilo bordado, base ergonómica.'
  },
]



function Trabajos() {
  const [selectedTrabajo, setSelectedTrabajo] = useState(null)  
  

  const [flippedCard, setFlippedCard] = useState(null)  
  const toggleFlip = (id) => {
      setFlippedCard(flippedCard === id ? null : id) 
  }

  const openModal = (trabajo) => setSelectedTrabajo(trabajo)
  const closeModal = () => setSelectedTrabajo(null)


  return (
    
      <main className="main-content">
        <section className="section fade-in">
          <h1>Nuestros Trabajos</h1>
          <p>Explora nuestra galería de volantes tapizados. Cada pieza es única y hecha con pasión.</p>

          <div className="galeria">  
              {trabajosData.map((trabajo) => (
                <div 
                  key={trabajo.id} 
                  className={`flip-card ${flippedCard === trabajo.id ? 'flipped' : ''}`} 
                  onClick={() => toggleFlip(trabajo.id)}  // ← Flip siempre: Clic simple en card/img (no bloqueado)
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <h3>{trabajo.titulo}</h3>
                      <img 
                        src={trabajo.img} 
                        alt={trabajo.titulo} 
                        onDoubleClick={() => { 
                          if (window.innerWidth > 768) openModal(trabajo);
                        }}
                        style={{ cursor: 'pointer' }}  
                        title="Clic simple para ver info, doble clic para zoom (desktop)" 
                      />
                    </div>
                    <div className="flip-card-back">
                      
                      <p>{trabajo.descripcion}</p>
                      <p><strong>Materiales:</strong> {trabajo.materiales}</p>
                      
                      
                   
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </section>

        
      {/* ← FIX: Modal FUERA de main – Ahora global, cubre toda la pantalla (no atrapado) */}
      {selectedTrabajo && (
        <div className="flip-modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <img src={selectedTrabajo.img} alt={selectedTrabajo.titulo} />
            <div className="modal-desc">
              <h2>{selectedTrabajo.titulo}</h2>
              <p>{selectedTrabajo.descripcion}</p>
              <p><strong>Materiales:</strong> {selectedTrabajo.materiales}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Trabajos

