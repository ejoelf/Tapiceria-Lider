function SobreMi() {
  return (
    <main className="main-content">
      <section className="section fade-in sobre-mi-section">  
        <h1>Sobre Mí</h1>
        <p>Soy Lucas Diaz, apasionado por la tapicería automotriz desde hace 5 años.</p>

        <div className="sobre-mi-content"> 
          <div className="foto-container">
            <img src="../public/image/FotoLucas.png" alt="Lucas Diaz" />  
          </div>
          <div className="texto-container">
            <p>En Tapicería Líder, me especializo en el tapizado de volantes de autos, transformando piezas comunes en obras de arte funcionales. Con mi taller en Rio Cuarto, utilizo materiales de primera calidad como cuero genuino, Alcantara y hilos resistentes para garantizar durabilidad y estilo.</p>
            <p>Mi experiencia incluye trabajos para autos clásicos, deportivos y de lujo. Cada proyecto es único: desde reparaciones hasta personalizaciones completas con logos bordados o grips ergonómicos. Mi compromiso es la satisfacción del cliente – ¡tu volante, tu visión!</p>
            <ul>
              <li> +5 años de experiencia en tapicería automotriz.</li>
              <li> Materiales importados y certificados.</li>
              <li> Taller equipado con herramientas profesionales.</li>
              <li> Atención personalizada y presupuestos sin costo.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SobreMi
