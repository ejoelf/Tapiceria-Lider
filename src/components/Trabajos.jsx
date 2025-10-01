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

const testimoniosData = [  
  { nombre: 'Juan Pérez', texto: 'Excelente trabajo en mi BMW. El volante quedó como nuevo, ¡recomendado 100%!' },
  { nombre: 'María López', texto: 'Rápido y profesional. Usaron materiales de calidad, mi auto se ve premium ahora.' },
  { nombre: 'Carlos Ruiz', texto: 'Personalización perfecta. Atención impecable, volveré por más.' }
]

function Trabajos() {
  const [selectedTrabajo, setSelectedTrabajo] = useState(null)  
  const [reseña, setReseña] = useState({ nombre: '', texto: '' })  

  const [flippedCard, setFlippedCard] = useState(null)  
  const toggleFlip = (id) => {
      setFlippedCard(flippedCard === id ? null : id) 
  }

  const openModal = (trabajo) => setSelectedTrabajo(trabajo)
  const closeModal = () => setSelectedTrabajo(null)

  const handleReseñaSubmit = (e) => {
    e.preventDefault()
    if (reseña.nombre && reseña.texto) {
      alert(`¡Gracias, ${reseña.nombre}! Tu reseña ha sido enviada. "${reseña.texto}"`)
      setReseña({ nombre: '', texto: '' })
    }
  }

  return (
    <>  {/* ← FIX: React Fragment – Permite modal fuera de main para z-index global */}
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
                        onDoubleClick={() => {  // ← FIX: Doble clic abre modal SOLO en desktop (no interfiere con flip simple)
                          if (window.innerWidth > 768) openModal(trabajo);
                        }}
                        style={{ cursor: 'pointer' }}  // Visual cue para interacción
                        title="Clic simple para ver info, doble clic para zoom (desktop)"  // ← Tooltip explicativo (opcional)
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

        <section className="section fade-in">
          <h2>Testimonios</h2>
          <div className="testimonios-grid">
            {testimoniosData.map((testimonio, index) => (
              <div key={index} className="testimonio-card">
                <p>"{testimonio.texto}"</p>
                <h4>- {testimonio.nombre}</h4>
              </div>
            ))}
          </div>

          <h3>¡Deja tu reseña!</h3>
          <form onSubmit={handleReseñaSubmit} className="reseña-form">
            <div className="form-group">
              <label>Tu Nombre:</label>
              <input
                type="text"
                value={reseña.nombre}
                onChange={(e) => setReseña({ ...reseña, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tu Reseña:</label>
              <textarea
                rows="4"
                value={reseña.texto}
                onChange={(e) => setReseña({ ...reseña, texto: e.target.value })}
                placeholder="Cuéntanos sobre tu experiencia..."
                required
              />
            </div>
            <button type="submit" className="btn">Enviar</button>
          </form>
        </section>
      </main>

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
    </>
  )
}

export default Trabajos

