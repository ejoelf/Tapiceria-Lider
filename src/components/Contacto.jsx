import { useState } from 'react'

function Contacto() {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      alert('Por favor, completa todos los campos.')
      return
    }

    setIsSubmitting(true)
    
    setTimeout(() => {
      alert(`¡Gracias, ${formData.nombre}! Mensaje enviado. Te contactaremos pronto.`)
      setFormData({ nombre: '', email: '', mensaje: '' })
      setIsSubmitting(false) 
    }, 1000)
  }

  return (
    <main className="main-content">  
      <section className="section fade-in contacto-section">  
        <h1>Contacto</h1>
        <p>Envíanos un mensaje y te responderemos en menos de 24 horas. O chatea directamente por WhatsApp.</p>

        <form onSubmit={handleSubmit} className="contacto-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej. juan@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows="5"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Describe tu consulta sobre tapizado de volantes..."
              required
            ></textarea>
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>

        <div className="contacto-info">
          <p><strong>O contáctanos directamente:</strong></p>
          <p><i className="fas fa-phone"></i> Tel: (0358) 154901015</p>
          <p><i className="fas fa-map-marker-alt"></i> Dirección: Cap. Félix Mestre 61, Río Cuarto, Córdoba</p>
        </div>
      </section>
    </main>
  )
}

export default Contacto